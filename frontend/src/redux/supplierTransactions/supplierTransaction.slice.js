import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transactionType: "purchase",
  paymentMethod: "cash",
  date: null,
  products: [],
};

const supplierTransactionSlice = createSlice({
  name: "supplierTransaction",
  initialState,
  reducers: {
    addProduct(state, action) {
      const p = action.payload || {};
      state.products.push({
        name: p.name ?? "",
        barcode: p.barcode ?? "",
        unit: p.unit ?? "piece",
        buyPrice: p.buyPrice ?? 0,
        quantity: p.quantity ?? 1,
        sellPrice: p.sellPrice ?? 0,
        amount: p.amount ?? 0,
      });
    },
    deleteProduct(state, action) {
      state.products = state.products.filter((_, i) => i !== action.payload);
    },
    updateProducts(state, action) {
      state.products = action.payload;
    },
    changePaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    },
    changeTransactionType(state, action) {
      state.transactionType = action.payload;
    },
    changeDate(state, action) {
      state.date = action.payload;
    },
  },
});

export const {
  addProduct,
  deleteProduct,
  updateProducts,
  changePaymentMethod,
  changeTransactionType,
  changeDate,
} = supplierTransactionSlice.actions;

export default supplierTransactionSlice.reducer;
