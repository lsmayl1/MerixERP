const moment = require("moment");
const { PrintReceipt } = require("../services/PrinterService");
const {
  Sales,
  SalesDetails,
  SalePayments,
  Products,
  ProductStock,
  sequelize,
  Sequelize,
  Op,
  SyncQueue,
} = require("../models");
const express = require("express");
const router = express.Router();

// Get all sales
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
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [fromDate, toDate],
        },
      },
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
          required: false,
        },
        {
          model: SalePayments,
          as: "payments",
        },
      ],
    });

    // Nakit ve kart toplamlarını hesapla
    let cashTotal = 0;
    let cardTotal = 0;

    sales.forEach((sale) => {
      sale.payments.forEach((payment) => {
        const sign = sale.transaction_type === "sale" ? 1 : -1;

        if (payment.payment_type === "cash") {
          cashTotal += sign * payment.amount;
        }

        if (payment.payment_type === "card") {
          cardTotal += sign * payment.amount;
        }
      });
    });

    const formattedSales = sales.map((sale) => {
      const details = sale.details;
      let profit = 0;
      if (Array.isArray(details)) {
        profit = details.reduce((sum, d) => {
          if (sale.transaction_type === "return") {
            return (
              sum -
              (Number(d.sell_price) - Number(d.buy_price)) *
                Number(d.quantity || 0)
            );
          } else if (
            sale.transaction_type === "sale" &&
            sale.discount &&
            sale.discount > 0
          ) {
            const discountRate = sale.discount / 100;
            const discountedSellPrice =
              Number(d.sell_price) * (1 - discountRate);
            return (
              sum +
              (discountedSellPrice - Number(d.buy_price)) *
                Number(d.quantity || 0)
            );
          } else {
            return (
              sum +
              (Number(d.sell_price) - Number(d.buy_price)) *
                Number(d.quantity || 0)
            );
          }
        }, 0);
      }

      return {
        ...sale.dataValues,
        date: moment(sale.date).tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
        profit: Number(profit.toFixed(2)),
      };
    });
    res.json({
      sales: formattedSales,
      paymentTotals: {
        cash: cashTotal.toFixed(2) + " ₼",
        card: cardTotal.toFixed(2) + " ₼",
      },
    });
  } catch (err) {
    console.log(err);
  }
});
// get by Id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.json({ error: "Id yoxdur " });
    }
    const sale = await Sales.findByPk(id, {
      include: [
        {
          model: SalesDetails,
          as: "details",
          include: [
            {
              model: Products,
              as: "product",
            },
          ],
        },
        {
          model: SalePayments,
          as: "payments",
        },
      ],
    });
    if (!sale) return res.json({ error: "Satis yoxdur" });

    const response = {
      saleId: sale.sale_id,
      totalAmount: sale.total_amount + " ₼",
      paymentMethod: sale.payment_method,
      transactionType: sale.transaction_type,
      discount: sale.discount + " %",
      discountedAmount: sale.discounted_amount + " ₼",
      payments: sale.payments.map((payment) => ({
        payment_type: payment.payment_type,
        amount: payment.amount,
      })),
      subtotalAmount: sale.subtotal_amount + " ₼",
      date: moment(sale.date).tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
      details: sale.details.map((detail) => ({
        quantity: detail.quantity,
        subtotal: detail.subtotal + " ₼",
        id: detail.product.id,
        name: detail.product.name,
        barcode: detail.product.barcode,
        sellPrice: detail.product.sellPrice + " ₼",
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.json({ error: "Server Xetasi" + error });
  }
});

router.post("/preview", async (req, res) => {
  const { items, discount } = req.body;
  const resultItems = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Ürün listesi boş." });
  }

  try {
    const grouped = {};

    for (const { barcode, quantity: sentQuantity } of items) {
      let productBarcode = barcode;
      let quantity = sentQuantity || 1;
      let unit = "piece";

      // Tartım barkodu kontrolü
      if (barcode.length === 13 && barcode.startsWith("22")) {
        const kgProduct = await Products.findOne({
          where: { barcode: barcode },
          attributes: ["barcode"],
        });

        if (kgProduct) {
          // Tam barcode varsa, quantity olarak gönderileni kullan
          productBarcode = kgProduct.barcode;
          quantity = sentQuantity || 1;
          unit = "kg";
        } else {
          // Yoksa tartım barkodu olarak işle
          const baseCode = barcode.substring(0, 7); // ilk 8 hane ürün kodu
          const weightStr = barcode.substring(7, 12); // son 5 hane ağırlık
          const weight = parseInt(weightStr, 10);
          quantity = weight / 1000; // 3 ondalık hassasiyet
          unit = "kg";

          const product = await Products.findOne({
            where: { barcode: { [Op.like]: `${baseCode}%` } },
            attributes: ["barcode"],
          });

          if (!product) continue;
          productBarcode = product.barcode;
        }
      }

      // Aynı ürün daha önce eklenmişse quantity'yi topla
      if (!grouped[productBarcode]) {
        grouped[productBarcode] = {
          productBarcode,
          quantity,
          unit,
        };
      } else {
        grouped[productBarcode].quantity += quantity;
      }
    }

    // 🧮 Hesapla ve response oluştur
    for (const productBarcode in grouped) {
      const { quantity, unit } = grouped[productBarcode];

      const product = await Products.findOne({
        where: { barcode: productBarcode },
        attributes: ["name", "sellPrice", "barcode"],
      });

      if (!product) continue;

      const subtotal = parseFloat(product.sellPrice) * quantity;

      resultItems.push({
        name: product.name,
        barcode: product.barcode, // ✅ sadece ürünün gerçek barkodu
        quantity,
        unit,
        sellPrice: parseFloat(product.sellPrice),
        subtotal,
      });
    }
    let subtotal = resultItems.reduce((acc, item) => acc + item.subtotal, 0);

    let total = subtotal;
    let discountAmount = 0;

    if (discount && discount > 0) {
      const discountRate = discount / 100;
      discountAmount = parseFloat((subtotal * discountRate).toFixed(2));
      total = parseFloat((subtotal - discountAmount).toFixed(2));
    }

    res.json({
      subtotal,
      total: total,
      items: resultItems,
      discountAmount: discountAmount.toFixed(2),
    });
  } catch (error) {
    console.error("Preview error:", error.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

// POST /sales
router.post("/create", async (req, res) => {
  try {
    const { products, payments, type, discount } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Products array cannot be empty" });
    }

    if (!payments && payments?.length === 0 && type === "sale") {
      throw new Error("At least one payment is required");
    }
    if (!type) {
      return res.status(400).json({ error: "Transaction type is required" });
    }

    const validTypes = ["sale", "return"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    let totalAmount = 0;
    let subtotalAmount = 0;
    const salesDetails = [];
    const stockUpdates = [];

    for (const item of products) {
      const barcode = item.barcode;
      const quantity = item.quantity ?? 1;

      const product = await Products.findOne({ where: { barcode } });

      if (!product) {
        return res.status(404).json({
          error: `Product with barcode ${barcode} not found`,
        });
      }

      if (quantity < 0.001) {
        return res.status(400).json({
          error: `Quantity for barcode ${barcode} must be greater than 0`,
        });
      }

      const subtotal = product.sellPrice * quantity;
      subtotalAmount += subtotal;

      const newStock =
        type === "sale" ? product.stock - quantity : product.stock + quantity;

      salesDetails.push({
        product_id: product.product_id,
        product_name: product.name,
        quantity,
        subtotal,
        buy_price: product.buyPrice,
        sell_price: product.sellPrice,
        previous_stock: product.stock,
        new_stock: newStock,
      });

      stockUpdates.push({
        product,
        quantity,
        isReturn: type === "return",
      });
    }

    const discountRate = discount ? discount / 100 : 0;
    const discountedAmount = parseFloat(
      (subtotalAmount * discountRate).toFixed(2)
    );
    totalAmount = parseFloat((subtotalAmount - discountedAmount).toFixed(2));

    const result = await sequelize.transaction(async (t) => {
      const sale = await Sales.create(
        {
          total_amount: totalAmount,
          subtotal_amount: subtotalAmount,
          discount: discount || 0,
          transaction_type: type,
          discounted_amount: discountedAmount,
        },
        { transaction: t }
      );

      await Promise.all(
        salesDetails.map(async (detail) => {
          await SalesDetails.create(
            {
              sale_id: sale.sale_id,
              product_id: detail.product_id,
              quantity: detail.quantity,
              subtotal: detail.subtotal,
              buy_price: detail.buy_price,
              sell_price: detail.sell_price,
            },
            { transaction: t }
          );
        })
      );

      await Promise.all(
        stockUpdates.map(async (update) => {
          const productStock = await ProductStock.findOne({
            where: { product_id: update.product.product_id },
            transaction: t,
          });

          const stockChange = update.isReturn
            ? `current_stock + ${update.quantity}`
            : `current_stock - ${update.quantity}`;

          if (productStock) {
            await productStock.update(
              {
                current_stock: sequelize.literal(stockChange),
                updated_at: new Date(),
              },
              { transaction: t }
            );
          } else {
            const initialStock = update.isReturn
              ? update.quantity
              : -update.quantity;

            await ProductStock.create(
              {
                product_id: update.product.product_id,
                current_stock: initialStock,
              },
              { transaction: t }
            );
          }
        })
      );

      if (type === "sale") {
        const paymentRows = payments?.map((p) => ({
          sale_id: sale.sale_id,
          payment_type: p.payment_type,
          amount: p.amount,
        }));

        await SalePayments.bulkCreate(paymentRows, { transaction: t });
      }
      return sale;
    });

    const response = {
      message:
        type === "sale"
          ? "Sale completed successfully"
          : "Return completed successfully",
      sale: {
        ...result.toJSON(),
        salesDetails: salesDetails.map((detail) => ({
          product_name: detail.product_name,
          quantity: detail.quantity,
          subtotal: detail.subtotal,
          buy_price: detail.buy_price,
          sell_price: detail.sell_price,
          stock_change: {
            previous: detail.previous_stock,
            current: detail.new_stock,
          },
        })),
      },
    };
    PrintReceipt({
      date: moment().tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
      details: salesDetails.map((detail) => ({
        name: detail.product_name,
        quantity: detail.quantity,
        sellPrice: detail.sell_price,
        subtotal: detail.subtotal.toFixed(2),
      })),
      payments: payments,
      totalAmount: totalAmount.toFixed(2),
      discountAmount: discountedAmount.toFixed(2),
      transactionType: type,
    });

    await SyncQueue.create({
      entity: "sale",
      record_id: result.sale_id,
      action: "create",
      payload: {
        products,
        type,
        totalAmount,
        discount,
        subtotalAmount,
        discountedAmount,
        userId: "85568a71-d681-405e-9077-6e3a09258586",
      },
      record_id: result.sale_id,
      status: "pending",
    });

    return res.status(201).json(response);
  } catch (error) {
    console.error("Outer error details:", error);
    return res.status(500).json({
      error: "Failed to complete transaction",
      details: error.message,
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Id gereklidir" });

  try {
    // Satış ve detaylarını bul
    const sale = await Sales.findByPk(id, {
      include: [{ model: SalesDetails, as: "details" }],
    });
    if (!sale) return res.status(404).json({ error: "Satış bulunamadı" });

    // Stokları geri ekle
    for (const detail of sale.details) {
      const product = await Products.findByPk(detail.product_id);
      if (product) {
        await product.update({
          stock: Sequelize.literal(`stock + ${detail.quantity}`),
        });
      }
    }

    // Detayları sil
    await SalesDetails.destroy({ where: { sale_id: id } });
    // Satışı sil
    await Sales.destroy({ where: { sale_id: id } });

    res.json({ message: "Satış başarıyla silindi" });
  } catch (error) {
    console.error("Satış silme hatası:", error);
    res.status(500).json({ error: "Satış silinemedi", details: error.message });
  }
});

module.exports = router;
