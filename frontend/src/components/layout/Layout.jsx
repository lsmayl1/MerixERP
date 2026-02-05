import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar/Sidebar";
import { useSelector } from "react-redux";
import { CashierHeader } from "../Header/CashierHeader";
export const Layout = () => {
  const [showSideBar, setShowSidebar] = useState(true);
  const { role } = useSelector((state) => state.authService);

  return (
    <div
      className={` h-screen min-h-0  w-full flex overflow-hidden  relative bg-MaingBg`}
    >
      <div
        className={`flex ${role !== "admin" ? "flex-col " : "flex-row"} w-full h-full overflow-hidden min-h-0`}
      >
        {showSideBar && role === "admin" ? (
          <Sidebar
            handleClose={() => setShowSidebar(false)}
            className={" h-full"}
          />
        ) : (
          <CashierHeader />
        )}

        <div className="px-2 w-full h-full min-h-0 flex flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
