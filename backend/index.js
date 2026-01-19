const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const { sequelize } = require("./models");
const app = express();
const path = require("path");
const fs = require("fs");
const { startSyncWorker } = require("./Sync/SyncWorker");
const routes = require("./routes");

dotenv.config();

app.use(express.json()); // For parsing JSON requests
app.use(cors());

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

// Sequelize Sync ve Server Başlatma
sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(
        `Server is running on http://localhost:${process.env.PORT || 5000}`,
      );
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

module.exports = app;
