const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// Ortama göre .env dosyasını yükle
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: console.log, // SQL loglarını görmek için true yapabilirsiniz
  },
);

module.exports = sequelize;
