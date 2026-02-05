import React from "react";
import { useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export const PrivateRoute = () => {
  const { token, role } = useSelector((state) => state.authService);
  if (!token) {
    return (
      <div>
        Not Authorized <NavLink to={"/login"}>Login</NavLink>
      </div>
    );
  }

  return <Outlet />;
};
