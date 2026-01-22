const { DataTypes } = require("sequelize");
const sequelize = require("../../database/database");

const Category = sequelize.define(
  "Category",
  {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "categories",
    timestamps: true,
  }
);

module.exports = Category;
