const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const ShortCut = sequelize.define("ShortCut", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  position: {
    type: DataTypes.INTEGER,
  },
});

module.exports = ShortCut;