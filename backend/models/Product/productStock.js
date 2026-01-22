const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const ProductStock = sequelize.define(
  "ProductStock",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Her ürün sadece bir kez listelenmeli
    },
    current_stock: {
      type: DataTypes.DECIMAL(10, 3), // 10 basamak, 3 ondalık basamak
      allowNull: false,
      defaultValue: 0,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "product_stocks",
  }
);

module.exports = ProductStock;
