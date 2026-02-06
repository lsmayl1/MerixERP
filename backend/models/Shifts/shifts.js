const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const Shifts = sequelize.define(
  "Shifts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    openedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closedAt: {
      type: DataTypes.DATE,
    },
    openingCash: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    closingCash: {
      type: DataTypes.DECIMAL(10, 2),
    },
    systemClosingCash: {
      type: DataTypes.DECIMAL(10, 2),
    },
    cashDifference: {
      type: DataTypes.DECIMAL(10, 2),
    },
    status: {
      type: DataTypes.ENUM("open", "closed"),
      defaultValue: "open",
    },
    note: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "shifts",
    timestamps: true,
  },
);

module.exports = Shifts;
