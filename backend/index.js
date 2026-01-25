const cors = require("cors");
const express = require("express");
const { sequelize } = require("./models");
const app = express();
const { startSyncWorker } = require("./Sync/SyncWorker");
const routes = require("./routes");
const { licenseMiddleware } = require("./license/license.middleware");
const config = require("./database/config.json");

app.use(express.json()); // For parsing JSON requests
app.use(cors());
app.use(licenseMiddleware);

routes(app);
// startSyncWorker();
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.isOperational ? err.message : "Somethings went wrong";
  console.log(err);

  res.status(statusCode).json({
    statusCode,
    success: false,
    message, // sadece temiz mesaj döner
  });
});

const port = 5000;
// Sequelize Sync ve Server Başlatma
sequelize
  .sync()
  .then(() => {
    app.listen(5000, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${port || 5000}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

module.exports = app;
