import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "create",
  transactionType: "purchase",
  paymentMethod: "cash",
  date: null,
  products: [],
};

const formatToYYYYMMDD = (dateString) => {
  return new Date(dateString).toISOString().split("T")[0];
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
        product_id: p.product_id ?? null,
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
    incrementQty: (state, action) => {
      const product = state.products.find(
        (p) => String(p.barcode) === String(action.payload)
      );
      if (product) {
        product.quantity += 1;
      }
    },
    replaceStatement: (state, action) => {
      state.transactionType = action.payload.transaction.type;
      state.paymentMethod = action.payload.transaction.payment_method;
      state.products = action.payload.details;
      state.date = formatToYYYYMMDD(action.payload.transaction.updatedAt);
    },
    updateMode: (state, action) => {
      state.mode = action.payload;
    },
    resetState(state) {
      state.transactionType = "purchase";
      state.paymentMethod = "cash";
      state.date = null;
      state.products = [];
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
  incrementQty,
  resetState,
  replaceStatement,
  updateMode,
} = supplierTransactionSlice.actions;

export default supplierTransactionSlice.reducer;
