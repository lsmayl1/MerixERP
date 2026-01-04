const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");
const { sequelize } = require("./models");
const productsRoute = require("./routes/productsRoute");
const salesRoutes = require("./routes/salesRoute");
const printerRoute = require("./routes/PrinterRoute");
const reportsRoute = require("./routes/reportsRoute");
const metricRoute = require("./routes/MetricRoute");
const cashTransactionsRoute = require("./routes/CashTransactionsRoute");
const stockTransactionsRoute = require("./routes/StockTransactionsRoute");
const SupplierRoute = require("./routes/Supplier/SupplierRoute");
const SupplierTransactionsRoute = require("./routes/Supplier/SupplierTransactions");
const CategoryRoute = require("./routes/CategoryRoute");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const AppError = require("./utils/AppError");
const { startSyncWorker } = require("./Sync/SyncWorker");

dotenv.config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === "development" ? ".env.development" : ".env"
  ),
});

app.use(express.json()); // For parsing JSON requests
app.use(cors());

const isDbConfigured =
  process.env.DB_HOST &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_NAME &&
  process.env.DB_PORT;

// Her durumda çalışan endpoint (Konfigürasyon için)
app.post("/configure-db", (req, res) => {
  const { host, port, user, password, database } = req.body;

  const configContent = `
DB_HOST=${host}
DB_PORT=${port}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${database}
PORT=${process.env.PORT || 5000}
    `;
  fs.writeFileSync(path.join(__dirname, ".env"), configContent);

  setTimeout(() => {
    process.exit(0); // PM2 bunu algılar ve uygulamayı yeniden başlatır
  }, 1000);

  return res.json({
    message: "Database config saved. Please restart the server.",
  });
});

if (isDbConfigured) {
  // Route'ları mount et
  app.use("/api/products", productsRoute);
  app.use("/api/sales", salesRoutes);
  app.use("/api/metrics", metricRoute);
  app.use("/api/printer", printerRoute);
  app.use("/api/reports", reportsRoute);
  app.use("/api/cash-transactions", cashTransactionsRoute);
  app.use("/api/stock-transactions", stockTransactionsRoute);
  app.use("/api/suppliers", SupplierRoute);
  app.use("/api/supplier-transactions", SupplierTransactionsRoute);
  app.use("/api/category", CategoryRoute);

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
          `Server is running on http://localhost:${process.env.PORT || 5000}`
        );
      });
    })
    .catch((err) => {
      console.error("Database connection failed:", err);
      process.exit(1);
    });
} else {
  console.log(
    "Database config missing. Only /configure-db endpoint is available."
  );
  app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
    console.log(
      `Server running in limited mode on http://localhost:${
        process.env.PORT || 5000
      }`
    );
  });
}

module.exports = app;
