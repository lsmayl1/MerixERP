const {
  Sales,
  SalesDetails,
  Products,
  SalePayments,
} = require("../models/index");
const AppError = require("../utils/AppError");
const moment = require("moment");
const getSaleById = async (id) => {
  try {
    if (!id) {
      throw new AppError("Sale ID is required", 400);
    }
    const sale = await Sales.findOne({
      where: { sale_id: id },
      include: [
        {
          model: SalesDetails,
          as: "details",
          include: [
            {
              model: Products,
              as: "product",
            },
          ],
        },
        {
          model: SalePayments,
          as: "payments",
        },
      ],
    });
    if (!sale) throw new AppError("Sale not found", 404);

    const response = {
      saleId: sale.sale_id,
      totalAmount: sale.total_amount,
      payments: sale.payments,
      date: moment(sale.date).tz("Asia/Dubai").format("DD-MM-YYYY HH:mm:ss"),
      discountedAmount: sale.discounted_amount,
      details: sale.details.map((detail) => ({
        quantity: parseFloat(detail.quantity).toFixed(2),
        subtotal: detail.subtotal,
        id: detail.product.id,
        name: detail.product.name,
        barcode: detail.product.barcode,
        sellPrice: detail.product.sellPrice,
      })),
    };

    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getSaleById,
};
