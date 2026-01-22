const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const StockTransactions = sequelize.define(
  "StockTransactions",
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2), // 10 hane
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Varsayılan olarak şu anki tarih/saat
    },
    description: {
      type: DataTypes.STRING(255), // Maksimum 255 karakter
      allowNull: false,
      validate: {
        len: [1, 255], // En az 1, en fazla 255 karakter
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // 10 hane, 2 ondalık
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM("in", "out"), // İşlem türü: "in" veya "out"
      allowNull: false,
    },
  },
  {
    timestamps: false, // Sequelize’nin otomatik createdAt/updatedAt eklemesini kapat
    tableName: "stock_transactions", // Tablo adı
  },
);

module.exports = StockTransactions;
