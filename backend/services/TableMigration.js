const { Sales, SalePayments } = require("../models/index");

const TableMigrationSale = async () => {
  try {
    const sales = await Sales.findAll();

    if (sales.length > 0) {
      console.log("Sale migration started");
      for (const sale of sales) {
        const totalAmount = Number(sale.total_amount) || 0;

        await SalePayments.create({
          sale_id: sale.sale_id,
          payment_type: "cash",
          amount: sale.total_amount,
        });
      }

      console.log("Sale migration finished");
    }
  } catch (error) {
    console.error("Sale migration error:", error);
  }
};

TableMigrationSale();
