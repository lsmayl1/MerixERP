const { Sequelize } = require("sequelize");
const config = require("./config.json");

const sequelize = new Sequelize(
  config.db.DB_NAME,
  config.db.DB_USER,
  config.db.DB_PASSWORD,
  {
    host: config.db.DB_HOST,
    port: config.db.DB_PORT,
    dialect: "postgres",
    logging: console.log, // SQL loglarını görmek için true yapabilirsiniz
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
);

module.exports = sequelize;
