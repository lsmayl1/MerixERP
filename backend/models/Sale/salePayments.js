const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const SalePayments = sequelize.define(
  "sale_payments",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    sale_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    payment_type: {
      type: DataTypes.ENUM("cash", "card"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "sale_payments",
    timestamps: true,
    underscored: true,
  }
);

module.exports = SalePayments;
