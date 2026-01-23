const { Sequelize, Op } = require("sequelize");
const sequelize = require("../database/database");
const Sales = require("./Sale/sales");
const Products = require("./Product/products");
const SalesDetails = require("./Sale/salesDetails");
const CashTransactions = require("./Supplier/cashTransactions");
const StockTransactions = require("./Product/stockTransactions");
const ProductStock = require("./Product/productStock");
const ShortCut = require("./Product/shortCut");
const Suppliers = require("./Supplier/Suppliers");
const SupplierTransactions = require("./Supplier/SupplierTransaction");
const SupplierTransactionDetails = require("./Supplier/SupplierTransactionDetails");
const Category = require("./Product/category");
const SyncQueue = require("./Sync/SyncQuene");
const SalePayments = require("./Sale/salePayments");
const User = require("./user/userModel");
// 🔹 İlişkileri Tanımla
Sales.hasMany(SalesDetails, { foreignKey: "sale_id", as: "details" });
SalesDetails.belongsTo(Sales, { foreignKey: "sale_id", as: "sale" });
Sales.hasMany(SalePayments, { foreignKey: "sale_id", as: "payments" });
SalePayments.belongsTo(Sales, { foreignKey: "sale_id", as: "payments" });

StockTransactions.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});
Products.hasOne(ProductStock, {
  foreignKey: "product_id",
  as: "stock",
});

ShortCut.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});
Products.hasOne(ShortCut, { foreignKey: "product_id", as: "shortcut" });

ProductStock.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});
Products.hasMany(SalesDetails, {
  foreignKey: "product_id",
  as: "salesDetails",
});
SalesDetails.belongsTo(Products, { foreignKey: "product_id", as: "product" });

// 🔹 Modelleri ve Sequelize Nesnesini Dışa Aktar

SupplierTransactions.belongsTo(Suppliers, {
  foreignKey: "supplier_id",
  as: "supplier",
});

Suppliers.hasMany(SupplierTransactions, {
  foreignKey: "supplier_id",
  as: "transactions",
});

// 2) SupplierTransactions → SupplierTransactionDetails
SupplierTransactions.hasMany(SupplierTransactionDetails, {
  foreignKey: "transaction_id", // Detay tablosundaki foreign key
  as: "details",
});

SupplierTransactionDetails.belongsTo(SupplierTransactions, {
  foreignKey: "transaction_id",
  as: "transaction",
});

// 3) Products → SupplierTransactionDetails
Products.hasMany(SupplierTransactionDetails, {
  foreignKey: "product_id",
  as: "transactionDetails",
});
SupplierTransactionDetails.belongsTo(Products, {
  foreignKey: "product_id",
  as: "product",
});

Category.hasMany(Category, {
  as: "subcategories",
  foreignKey: "parent_id",
});

Category.belongsTo(Category, {
  as: "parent",
  foreignKey: "parent_id",
});
Products.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});
Category.hasMany(Products, {
  foreignKey: "category_id",
  as: "products",
});

module.exports = {
  sequelize,
  Sequelize,
  Sales,
  SalePayments,
  Products,
  SalesDetails,
  Op,
  CashTransactions,
  StockTransactions,
  ProductStock,
  Suppliers,
  SupplierTransactions,
  SupplierTransactionDetails,
  Category,
  SyncQueue,
  ShortCut,
  User,
};
