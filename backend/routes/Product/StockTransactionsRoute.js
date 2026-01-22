const express = require("express");
const router = express.Router();
const {
  StockTransactions,
  Products,
  ProductStock,
  Op,
} = require("../../models/index");
const formatDate = require("../../utils/dateUtils");
// GET all stock transactions
router.post("/", async (req, res) => {
  const { from, to } = req.body;
  // Parse the from date explicitly
  const fromDate = new Date(from);
  let toDate = to ? new Date(to) : new Date(from);
  if (!to) toDate.setHours(23, 59, 59, 999); // Set to 23:59:59.999 of the same day

  // Validate dates
  const isValidDate = (date) => date instanceof Date && !isNaN(date);
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    return res.status(400).json({ error: "Geçersiz tarih formatı" });
  }
  try {
    const transactions = await StockTransactions.findAll({
      where: {
        date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      include: [{ model: Products, as: "product", attributes: ["name"] }],
    });
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No stock transactions found." });
    }

    // Date bilgisini formatla
    const formatted = transactions.map((t) => ({
      ...t.toJSON(),
      unit_price: parseFloat(t.unit_price).toFixed(2) + " " + "₼",
      amount: parseFloat(t.amount).toFixed(2) + " " + "₼",
      quantity: parseFloat(t.quantity).toFixed(2),
      date: formatDate(t.date),
      product_name: t.product.name,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching stock transactions:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching stock transactions." });
  }
});
router.post("/create", async (req, res) => {
  const {
    product_id,
    unit_price,
    quantity,
    date,
    description,
    transaction_type,
  } = req.body;

  try {
    // string -> number dönüşümleri
    const parsedQuantity = parseFloat(quantity);
    const parsedUnitPrice = parseFloat(unit_price);
    const amount = parsedUnitPrice * parsedQuantity;

    // 1. Yeni stok hareketini kaydet
    const newTransaction = await StockTransactions.create({
      product_id,
      unit_price: parsedUnitPrice,
      quantity: parsedQuantity,
      date,
      description,
      amount,
      transaction_type,
    });

    // 2. ProductStock kaydını getir veya oluştur
    let productStock = await ProductStock.findOne({ where: { product_id } });

    if (!productStock) {
      const initialStock =
        transaction_type === "in" ? parsedQuantity : -parsedQuantity;

      productStock = await ProductStock.create({
        product_id,
        current_stock: initialStock,
        updated_at: new Date(),
      });
    } else {
      const currentStock = parseFloat(productStock.current_stock || 0);
      const newStock =
        transaction_type === "in"
          ? currentStock + parsedQuantity
          : currentStock - parsedQuantity;

      await productStock.update({
        current_stock: newStock,
        updated_at: new Date(),
      });
    }

    // 3. Güncellenmiş stok ile cevap dön
    res.status(201).json({
      transaction: newTransaction,
      currentStock: productStock.current_stock,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while creating the stock",
    });
  }
});

// PUT to update a stock transaction
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    product_id,
    unit_price,
    quantity,
    date,
    description,
    amount,
    transaction_type,
  } = req.body;

  try {
    const transaction = await StockTransactions.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: "Stock transaction not found." });
    }

    await transaction.update({
      product_id,
      unit_price,
      quantity,
      date,
      description,
      amount,
      transaction_type,
    });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while updating the stock transaction.",
    });
  }
});
// DELETE a stock transaction
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await StockTransactions.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: "Stock transaction not found." });
    }

    await transaction.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while deleting the stock transaction.",
    });
  }
});

router.get("/product/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Products.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Stok hareketlerini getir
    const transactions = await StockTransactions.findAll({
      where: { product_id: id },
      include: [{ model: Products, as: "product", attributes: ["name"] }],
    });

    // Date bilgisini formatla
    const formattedTransactions = transactions.map((t) => ({
      ...t.toJSON(),
      unit_price: parseFloat(t.unit_price).toFixed(2) + " " + "₼",
      amount: parseFloat(t.amount).toFixed(2) + " " + "₼",
      quantity: parseFloat(t.quantity).toFixed(2),
      date: formatDate(t.date),
      product_name: t.product.name,
    }));

    res.status(200).json({ product, transactions: formattedTransactions });
  } catch (error) {
    console.error("Error fetching product stock transactions:", error);
    res.status(500).json({
      error: "An error occurred while fetching product stock transactions.",
    });
  }
});

// Export the router
module.exports = router;
