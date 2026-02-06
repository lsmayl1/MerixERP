import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
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
      <div className={`flex  w-full h-full overflow-hidden min-h-0 gap-2`}>
        {showSideBar && role === "admin" ? (
          <Sidebar
            handleClose={() => setShowSidebar(false)}
            className={" h-full"}
          />
        ) : (
          <CashierHeader />
        )}

        <div className="w-full  py-2 h-full min-h-0 flex flex-col overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
