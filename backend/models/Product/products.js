const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const Products = sequelize.define(
  "products",
  {
    product_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true, // Assuming barcodes should be unique
    },
    buyPrice: {
      type: DataTypes.DECIMAL(10, 2), // 10 digits, 2 after decimal
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("buyPrice");
        return rawValue === null ? null : parseFloat(rawValue).toFixed(2);
      },
    },
    sellPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("sellPrice");
        return rawValue === null ? null : parseFloat(rawValue).toFixed(2);
      },
    },
    unit: {
      type: DataTypes.ENUM("piece", "kg"),
      allowNull: false,
      defaultValue: "piece",
    },

    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW, // Automatically set to current timestamp
    },
  },
  {
    timestamps: false, // Disable Sequelize's default createdAt/updatedAt
    tableName: "products", // Explicit table name
  },
);

module.exports = Products;
