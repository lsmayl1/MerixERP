import React from "react";
import { useSelector } from "react-redux";
import { NavLink, Outlet, Navigate } from "react-router-dom";

export const PrivateRoute = () => {
  const { token, role } = useSelector((state) => state.authService);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
