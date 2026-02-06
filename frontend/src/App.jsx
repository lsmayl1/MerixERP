import React from "react";
import "./style/index.css";
import { Navigate, Route, Router, Routes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Layout } from "./components/layout/Layout";
import { SalesReports } from "./pages/Reports/SalesReports";
import { Products } from "./pages/Products/Products";
import { ProductReports } from "./pages/Reports/ProductReports";
import { ReportsLayout } from "./components/layout/ReportsLayout";
import { CashMovements } from "./pages/Reports/CashMovements";
import { StockMovements } from "./pages/Stock/StockMovements";
import { ProductDetails } from "./pages/Products/ProductDetails";
import { Suppliers } from "./pages/Suppliers";
import { SupplierDetails } from "./pages/Suppliers/SupplierDetails";
import { Category } from "./pages/Category/Category";
import { CategoryDetails } from "./pages/Category/CategoryDetails";
import { Login } from "./pages/auth/login";
import { Pos } from "./pages/Pos";
import { Register } from "./pages/auth/register";
import { PrivateRoute } from "./routes/privateRoute";
import { CashierLogin } from "./pages/auth/Cashier";
import { Employee } from "./pages/Employee";
import { ShiftReport } from "./pages/Reports/shiftReport";
export const App = () => {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="category" element={<Category />} />
          <Route path="category/:id" element={<CategoryDetails />} />

          <Route path="stock-movements" element={<StockMovements />} />

          <Route path="shift-report" element={<ShiftReport />} />

          <Route path="reports" element={<ReportsLayout />}>
            <Route index element={<Navigate to="sale" replace />} />
            <Route index path="sale" element={<SalesReports />} />
            <Route path="products" element={<ProductReports />} />
            <Route path="cash-movements" element={<CashMovements />} />
          </Route>

          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/:id" element={<SupplierDetails />} />
          <Route path="employee" element={<Employee />} />
          <Route path="pos" element={<Pos />} />
        </Route>
      </Route>

      <Route path="login" element={<Login />} />
      <Route path="cashier-login" element={<CashierLogin />} />

      <Route path="register" element={<Register />} />
    </Routes>
  );
};
