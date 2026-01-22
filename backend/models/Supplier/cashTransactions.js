const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const CashTransactions = sequelize.define(
  "cashTransactions",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    transactionType: {
      type: DataTypes.ENUM("in", "out"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.ENUM("cash", "card", "other"),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "cashTransactions",
  },
);

module.exports = CashTransactions;
