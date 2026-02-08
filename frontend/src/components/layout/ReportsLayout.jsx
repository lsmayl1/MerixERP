import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { DateRange } from "../Date/DateRange";

export const ReportsLayout = () => {
  const { t } = useTranslation();
  const taskbar = [
    {
      name: "Satışlar",
      path: "/reports/sale",
    },
    {
      name: "Növbələr üzrə hesabat",
      path: "/reports/shifts",
    },
    {
      name: t("productReport"),
      path: "/reports/products",
    },
    {
      name: t("Ödənişlər"),
      path: "/reports/cash-movements",
    },
  ];
  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white rounded-lg p-4 flex gap-4 items-center">
        <ul className="flex gap-4">
          {taskbar.map((tb, index) => (
            <NavLink
              to={tb.path}
              key={index}
              className={({ isActive }) =>
                `${isActive ? "bg-[#0f172a] text-white" : ""} text-nowrap py-2 px-4 rounded-lg`
              }
            >
              <span></span> {tb.name}
            </NavLink>
          ))}
        </ul>
        <DateRange />
      </div>
      <Outlet />
    </div>
  );
};
