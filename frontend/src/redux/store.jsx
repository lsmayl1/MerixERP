import { configureStore } from "@reduxjs/toolkit";
import { ApiSlice } from "./slices/ApiSlice";
import { CashMovementSlice } from "./slices/CashMovementSlice";
import { StockMovementsSlice } from "./slices/StockMovementsSlice";
import { SupplierSlice } from "./slices/SupplierSlice";
import { CategorySlice } from "./slices/CategorySlice";
import supplierTransactionReducer from "./supplierTransactions/supplierTransaction.slice";
import { productsSlice } from "./products/products.slice";
import { ProductShortcutsApiSlice } from "./slices/productsShortcuts/ProductShortcutsSlice";
import { AuthApi } from "./slices/auth/AuthSlice";
import { authService } from "./slices/auth/authService";
import { dateRangeSlice } from "./dateRange/dateRangeSlice";
export const store = configureStore({
  reducer: {
    [ApiSlice.reducerPath]: ApiSlice.reducer,
    [CashMovementSlice.reducerPath]: CashMovementSlice.reducer,
    [StockMovementsSlice.reducerPath]: StockMovementsSlice.reducer,
    [SupplierSlice.reducerPath]: SupplierSlice.reducer,
    [CategorySlice.reducerPath]: CategorySlice.reducer,
    [ProductShortcutsApiSlice.reducerPath]: ProductShortcutsApiSlice.reducer,
    [AuthApi.reducerPath]: AuthApi.reducer,
    dateRangeSlice: dateRangeSlice.reducer,
    supplierTransaction: supplierTransactionReducer,
    products: productsSlice.reducer,
    authService: authService.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ApiSlice.middleware,
      CashMovementSlice.middleware,
      StockMovementsSlice.middleware,
      SupplierSlice.middleware,
      CategorySlice.middleware,
      ProductShortcutsApiSlice.middleware,
      AuthApi.middleware,
    ),
});
