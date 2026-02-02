const express = require("express");
const router = express.Router();
const {
  Sales,
  SalesDetails,
  Products,
  sequelize,
  Sequelize,
  ProductStock,
  StockTransactions,
  Op,
  SupplierTransactions,
  Suppliers,
} = require("../models");
const { GetSupplierDebt } = require("../services/SupplierService");

router.post("/sale", async (req, res) => {
  const { from, to } = req.body;

  try {
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
        },
      ],
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalSales = 0; // Satış sayı yalnız 'sale' üçün
    let totalStockCost = 0;

    sales.forEach((sale) => {
      const isReturn = sale.transaction_type === "return";

      const subtotal = Number(sale.subtotal_amount);
      const discountTotal = Number(sale.discounted_amount);

      sale.details.forEach((detail) => {
        const qty = Number(detail.quantity);
        const sell = Number(detail.sell_price);
        const buy = Number(detail.buy_price);

        const lineGross = sell * qty;

        const discountShare =
          subtotal > 0 ? (lineGross / subtotal) * discountTotal : 0;

        const revenue = lineGross - discountShare;
        const cost = buy * qty;
        const profit = revenue - cost;

        // ✅ SALE / RETURN düzgün fərqlənir
        totalRevenue += isReturn ? -revenue : revenue;
        totalStockCost += isReturn ? cost : -cost;
        totalProfit += isReturn ? -profit : profit;
      });

      if (!isReturn) totalSales++;
    });

    res.json({
      totalRevenue: totalRevenue.toFixed(2) + " ₼",
      totalSales, // yalnız `sale` sayılır
      totalProfit: totalProfit.toFixed(2) + " ₼",
      totalStockCost: totalStockCost.toFixed(2) + " ₼",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Products.findAll({
      attributes: [
        "product_id",
        "name",
        "barcode",
        "sellPrice",
        "buyPrice",
        "unit",
      ],
      include: [
        {
          model: ProductStock,
          as: "stock",
          attributes: ["current_stock"],
        },
      ],
      order: [["name", "ASC"]],
      raw: true,
      nest: true,
      subQuery: false,
    });

    if (products.length === 0) {
      return res.json([]);
    }

    // Sayılar yoksa 0, varsa binlik ayraçlı string olarak döndürülür
    const totalProducts = products?.length || 0;
    const kgBasedProducts =
      products?.filter((p) => p.unit === "kg").length || 0;
    const pieceBasedProducts =
      products?.filter((p) => p.unit === "piece").length || 0;
    const zeroOrNegativeStock =
      products?.filter((p) => (p.stock.current_stock ?? 0) <= 0).length || 0;

    // Toplam stok miktarı (ProductStock tablosundaki current_stock alanı)
    const totalStock = products
      ? products.reduce(
          (sum, p) => sum + Number(p.stock.current_stock ?? 0) * p.buyPrice,
          0,
        )
      : 0;

    res.json({
      totalProducts: totalProducts.toLocaleString("tr-TR"),
      kgBasedProducts: kgBasedProducts.toLocaleString("tr-TR"),
      pieceBasedProducts: pieceBasedProducts.toLocaleString("tr-TR"),
      zeroOrNegativeStock: zeroOrNegativeStock.toLocaleString("tr-TR"),
      totalStock: totalStock.toFixed(2),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/products-sold", async (req, res) => {
  const { from, to } = req.body;

  try {
    // İlgili tarihlerdeki satış detaylarını çek
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["buy_price", "quantity"],
        },
      ],
    });

    let quantitySold = 0;
    let totalStockCost = 0;

    sales.forEach((sale) => {
      if (Array.isArray(sale.details)) {
        sale.details.forEach((detail) => {
          const qty = Number(detail.quantity) || 0;
          const buyPrice = Number(detail.buy_price) || 0;
          quantitySold += qty;
          totalStockCost += buyPrice * qty;
        });
      }
    });

    res.json({
      quantitySold: quantitySold.toLocaleString("tr-TR"),
      totalStockCost: totalStockCost.toFixed(2) + " ₼",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/dashboard", async (req, res) => {
  const { from, to } = req.body;

  try {
    const sales = await Sales.findAll({
      where: {
        date: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
        },
      ],
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalSales = 0; // yalnız `type === 'sale'` sayılacaq

    sales.forEach((sale) => {
      const isReturn = sale.transaction_type === "return";

      if (!isReturn) totalSales++;

      if (Array.isArray(sale.details)) {
        sale.details.forEach((detail) => {
          const quantity = Number(detail.quantity);
          const revenue = Number(detail.sell_price) * quantity;
          const cost = Number(detail.buy_price) * quantity;
          const profit = revenue - cost;

          const sign = isReturn ? -1 : 1;

          totalRevenue += revenue * sign;
          totalProfit += profit * sign;
        });
      }
      if (!isReturn && sale.discounted_amount) {
        const discount = Number(sale.discounted_amount);
        totalRevenue -= discount;
        totalProfit -= discount;
      }
    });

    const productStocks = await ProductStock.findAll({
      include: [
        {
          model: Products,
          as: "product",
          attributes: ["buyPrice"],
        },
      ],
    });

    let totalStockCost = 0;

    productStocks.forEach((stock) => {
      const quantity = Number(stock.current_stock) || 0;
      const buyPrice = Number(stock.product.buyPrice) || 0;
      totalStockCost += quantity * buyPrice;
    });

    res.json({
      totalRevenue: totalRevenue.toFixed(2) + " ₼",
      totalSales,
      totalProfit: totalProfit.toFixed(2) + " ₼",
      totalStockCost: totalStockCost.toFixed(2) + " ₼",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bestSellers", async (req, res) => {
  try {
    // En çok satılan 20 ürünü bul
    const bestSellers = await SalesDetails.findAll({
      attributes: [
        "product_id",
        [sequelize.fn("SUM", sequelize.col("SalesDetails.quantity")), "sold"],
      ],
      group: [
        "SalesDetails.product_id",
        "product.product_id",
        "product.name",
        "product.barcode",
      ],
      order: [[sequelize.literal("sold"), "DESC"]],
      limit: 10,
      include: [
        {
          model: Products,
          as: "product",
          attributes: ["product_id", "name", "barcode"],
        },
      ],
      raw: true,
      nest: true,
    });

    // Kalan ürünleri bul (bestSeller olmayanlar)
    const bestSellerIds = bestSellers.map((item) => item.product_id);

    // Stokları ProductStock tablosundan çek
    const allProductIds = [
      ...bestSellerIds,
      ...(
        await Products.findAll({
          where: { product_id: { [Op.notIn]: bestSellerIds } },
          attributes: ["product_id"],
          raw: true,
        })
      ).map((p) => p.product_id),
    ];
    const productStocks = await ProductStock.findAll({
      where: { product_id: allProductIds },
      attributes: ["product_id", "current_stock"],
      raw: true,
    });
    const stockMap = {};
    productStocks.forEach((s) => {
      stockMap[s.product_id] = s.current_stock;
    });

    // Kalan ürünleri bul (bestSeller olmayanlar)
    const restProducts = await Products.findAll({
      where: {
        product_id: { [Op.notIn]: bestSellerIds },
      },
      order: [["product_id", "ASC"]],
      limit: 20,
      attributes: ["product_id", "name", "barcode"],
      raw: true,
    });

    // restProducts'a sold alanı ekle (0 olarak) ve stock ekle
    const restProductsWithSold = restProducts.map((item) => ({
      ...item,
      sold: 0,
      stock: stockMap[item.product_id] ?? 0,
    }));

    // Sonuçları birleştir
    const result = [
      ...bestSellers.map((item) => ({
        product_id: item.product_id,
        name: item.product.name,
        barcode: item.product.barcode,
        sold: Number(item.sold),
        stock: stockMap[item.product_id] ?? 0,
      })),
      ...restProductsWithSold,
    ];

    // Tümünü tekrar stok miktarına göre azdan çoğa sırala
    result.sort((a, b) => a.stock - b.stock);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getWeekNumber(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const weekNumber =
    Math.round(
      ((target - firstThursday) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    ) + 1;
  return weekNumber;
}

router.get("/revenue", async (req, res) => {
  try {
    const { type = "daily" } = req.query;
    const sales = await Sales.findAll();
    const totals = {};

    sales.forEach((sale) => {
      const dateObj = new Date(sale.date);
      let key;

      switch (type) {
        case "hourly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(
            2,
            "0",
          )} ${String(dateObj.getHours()).padStart(2, "0")}:00`;
          break;
        case "daily":
          key = `${String(dateObj.getMonth() + 1).padStart(
            2,
            "0",
          )}-${String(dateObj.getDate()).padStart(2, "0")}`;
          break;
        case "weekly":
          const weekStart = new Date(dateObj);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
          break;
        case "monthly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}`;
          break;
        default:
          return res.status(400).json({ error: "Invalid type parameter" });
      }

      const amount = Number(sale.total_amount || 0);

      if (sale.transaction_type === "return") {
        totals[key] = (totals[key] || 0) - amount;
      } else {
        totals[key] = (totals[key] || 0) + amount;
      }
    });

    const result = Object.entries(totals).map(([date, revenue]) => ({
      date,
      revenue: Number(revenue.toFixed(2)),
    }));

    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    const average =
      result.length > 0 ? Number((totalRevenue / result.length).toFixed(2)) : 0;

    res.json({
      average: average + " ₼",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/profit", async (req, res) => {
  try {
    const { type = "daily" } = req.query;
    const sales = await Sales.findAll({
      include: [
        {
          model: SalesDetails,
          as: "details",
          attributes: ["sell_price", "buy_price", "quantity"],
        },
      ],
    });

    const profits = {};

    sales.forEach((sale) => {
      const dateObj = new Date(sale.date);
      let key;

      switch (type) {
        case "hourly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(
            2,
            "0",
          )} ${String(dateObj.getHours()).padStart(2, "0")}:00`;
          break;
        case "daily":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
          break;
        case "weekly":
          const weekStart = new Date(dateObj);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          key = `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
          break;
        case "monthly":
          key = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1,
          ).padStart(2, "0")}`;
          break;
        default:
          return res.status(400).json({ error: "Invalid type parameter" });
      }

      let totalProfit = 0;

      if (Array.isArray(sale.details)) {
        sale.details.forEach((detail) => {
          const sellPrice = Number(detail.sell_price) || 0;
          const buyPrice = Number(detail.buy_price) || 0;
          const quantity = Number(detail.quantity) || 0;

          if (buyPrice !== 0) {
            const profit = (sellPrice - buyPrice) * quantity;

            if (sale.transaction_type === "return") {
              totalProfit -= profit;
            } else {
              totalProfit += profit;
            }
          }
        });
      }

      profits[key] = (profits[key] || 0) + totalProfit;
    });

    const result = Object.entries(profits).map(([date, profit]) => ({
      date,
      profit: Number(profit.toFixed(2)),
    }));

    const totalProfit = result.reduce((sum, item) => sum + item.profit, 0);
    const average =
      result.length > 0 ? Number((totalProfit / result.length).toFixed(2)) : 0;

    res.json({
      average: average + " ₼",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/payments-total", async (req, res) => {
  try {
    const suppliers = await Suppliers.findAll();

    if (!suppliers || suppliers.length === 0) {
      return res.json({ total: 0, supplierCount: 0 });
    }

    let total = 0;

    // bütün supplier-lərin borcunu hesabla
    await Promise.all(
      suppliers.map(async (supplier) => {
        const supplierDebt = await GetSupplierDebt(supplier.id);
        total += Number(supplierDebt || 0);
      }),
    );

    const supplierCount = suppliers.length;

    res.json({ total: total.toFixed(2), supplierCount });
  } catch (error) {
    console.error("Error calculating total payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
