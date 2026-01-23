const express = require("express");
const router = express.Router();

const {
  Suppliers,
  SupplierTransactions,
  SupplierTransactionDetails,
  ProductStock,
} = require("../../models/index");
const formatDate = require("../../utils/dateUtils");
const {
  CreateTransaction,
  GetSupplierTransactionsWithDetails,
  GetSupplierInvoice,
  GetSupplierDebt,
  UpdateSupplierTransaction,
  UpdateSupplierInvoice,
} = require("../../services/SupplierService");
const { UpdateStockValue } = require("../../services/Product/ProductService");
router.get("/", async (req, res) => {
  try {
    const transactions = await SupplierTransactions.findAll({
      include: [
        {
          model: Suppliers,
          as: "supplier",
          attributes: ["name", "phone"],
        },
      ],
    });

    if (!transactions || transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found", transactions: [] });
    }

    // Her bir transaction'ın tarihini sadece YYYY-MM-DD formatında string yap
    const formattedTransactions = transactions.map((t) => {
      const dateOnly =
        t.date instanceof Date ? t.date.toISOString().split("T")[0] : t.date;

      return {
        ...t.toJSON(), // Sequelize instance'ı düz objeye çevir
        date: dateOnly, // Tarihi formatla
      };
    });

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching supplier transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/change-all-cashtocredit", async (_, res) => {
  try {
    const suppliers = await Suppliers.findAll({
      include: {
        model: SupplierTransactions,
        as: "transactions",
        where: { payment_method: "cash" },
      },
    });

    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    for (const supplier of suppliers) {
      for (const transaction of supplier.transactions) {
        transaction.payment_method = "credit";
        await transaction.save();
      }
    }

    res
      .status(200)
      .json({ message: "All cash transactions updated to credit" });
  } catch (error) {
    console.error("Error updating transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const transactions = await SupplierTransactions.findAll({
      where: { supplier_id: id },
      include: [
        {
          model: Suppliers,
          as: "supplier",
          attributes: ["name", "phone"],
        },
      ],
    });

    if (transactions.length === 0) {
      return res.json({
        message: "No transactions found for this supplier",
        transactions: [],
      });
    }
    const totalDebt = await GetSupplierDebt(id);
    res.status(200).json({
      transactions,
      totalAmount: totalDebt + " ₼",
    });
  } catch (error) {
    console.error("Error fetching supplier transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function parseDateString(dateStr) {
  const [day, month, year] = dateStr.split(".");
  if (!day || !month || !year) return null;

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
// Odenis emeliyati
router.post("/", async (req, res) => {
  const { supplier_id, amount, date, payment_method, type } = req.body;

  try {
    if (!supplier_id || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let finalDate;

    if (!date) {
      finalDate = new Date(); // Şu anki tarih + saat
    } else {
      const formattedDateStr = new Date(date);
      if (!formattedDateStr) {
        return res
          .status(400)
          .json({ message: "Invalid date format. Use dd.mm.yyyy" });
      }

      finalDate = new Date(formattedDateStr); // ISO formatlı string -> Date
      if (isNaN(finalDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid date value after parsing" });
      }
    }

    const newTransaction = await SupplierTransactions.create({
      supplier_id,
      amount,
      date: finalDate, // Artık bu Date objesi, Sequelize ve DB için uygundur
      payment_method,
      type,
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error creating supplier transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({ message: "Id not found" });
  }

  try {
    // Silinecek kaydı bul (isteğe bağlı ama kullanıcıya bilgi vermek için faydalı)
    const transaction = await SupplierTransactions.findByPk(id, {
      include: [
        {
          model: SupplierTransactionDetails,
          as: "details",
        },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    const type = transaction.type === "purchase" ? -1 : 1;
    transaction.details?.forEach(async (detail) => {
      try {
        const value = Number(detail.quantity) * type;
        await UpdateStockValue(detail.product_id, value);
      } catch (error) {
        return;
      }
    });
    console.log(transaction.toJSON());

    // Silme işlemi
    await transaction.destroy();

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/v2/", async (req, res, next) => {
  try {
    const transaction = await CreateTransaction(req.body);
    return res.json(transaction);
  } catch (error) {
    next(error);
  }
});

router.get("/v2/:id", async (req, res, next) => {
  try {
    const transactions = await GetSupplierTransactionsWithDetails(
      req.params.id,
    );
    return res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.post("/v2/:supplier_id/:transaction_id", async (req, res, next) => {
  try {
    const transactionDetails = await GetSupplierInvoice(
      req.params.supplier_id,
      req.params.transaction_id,
    );
    return res.json(transactionDetails);
  } catch (error) {
    next(error);
  }
});

router.put("/v2/:transaction_id", async (req, res, next) => {
  try {
    const updatedTransaction = await UpdateSupplierInvoice(
      req.params.transaction_id,
      req.body,
    );
    res.json(updatedTransaction);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedTransaction = await UpdateSupplierTransaction(id, req.body);
    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
