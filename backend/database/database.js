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
    pool: {
      max: 25, // aynı anda max connection
      min: 5, // boşta da tut
      acquire: 10000, // 10 sn connection bekle, sonra hata ver
      idle: 10000, // 10 sn boşta kalan kapansın
    },
    logging: true, // SQL loglarını görmek için true yapabilirsiniz
  },
);

module.exports = sequelize;
