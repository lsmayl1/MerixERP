const express = require("express");
const router = express.Router();


const { getSaleById } = require("../services/SaleService");

const { PrintReceipt, PrintLabel } = require("../services/PrinterService");

// Using pdf-to-printer
router.post("/label-print", async (req, res) => {
  try {
    await PrintLabel(req.body);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/sale-receipt/:id", async (req, res, next) => {
  try {
    const sale = await getSaleById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    PrintReceipt({
      date: sale.date,
      details: sale.details,
      totalAmount: sale.totalAmount || 0,
      discountAmount: sale.discountedAmount,
      payments: sale.payments,
    });
    res.json({ success: true, message: "Receipt sent to printer" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
