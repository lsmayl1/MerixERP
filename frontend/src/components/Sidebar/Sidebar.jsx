import React, { useEffect, useState } from "react";
import Dashboard from "../../assets/Sidebar/Dashboard";
import Box from "../../assets/Sidebar/Box";
import Reports from "../../assets/Sidebar/Reports";
import { NavLink } from "react-router-dom";
import { Kart } from "../../assets/Sidebar/Kart";
import { CloseIcon } from "../../assets/Close";
import { useTranslation } from "react-i18next";
import Delivery from "../../assets/Navigation/Delivery";
import StockBox from "../../assets/Navigation/StockBox";
import { Supplier } from "../../assets/Navigation/Supplier";
import Category from "../../assets/Navigation/Category";

export const Sidebar = ({ className, handleClose }) => {
  const { t } = useTranslation();
  const links = [
    { name: t("dashboard"), blank: false, path: "", icon: <Dashboard /> },
    { name: t("products"), blank: false, path: "products", icon: <Box /> },
    {
      name: t("stockMovements"),
      blank: false,
      path: "stock-movements",
      icon: <StockBox />,
    },
    {
      name: t("Kateqoriyalar"),
      blank: false,
      path: "category",
      icon: <Category />,
    },

    {
      name: t("reports"),
      blank: false,
      icon: <Reports />,
      path: "reports",
      category: [
        { name: t("saleReport"), path: "reports/sale" },
        {
          name: t("productReport"),
          path: "reports/products",
        },
        {
          name: t("cashMovement"),
          path: "reports/cash-movements",
        },
      ],
    },
    { name: t("supplier"), blank: true, path: "suppliers", icon: <Supplier /> },

    { name: t("pos"), blank: true, path: "pos", icon: <Kart /> },
    { name: t("KASSA 2"), blank: true, path: "pos-2", icon: <Kart /> },
  ];
  return (
    <div
      className={`max-md:absolute z-50 max-md:left-0 max-md:bg-white  flex pt-8 flex-col px-4 ${className}
      `}
    >
      <ul className="flex flex-col  gap-2">
        {links.map((link, index) => (
          <div className="flex flex-col gap-1  " key={index}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-4 border-mainBorder py-2 ${
                  isActive
                    ? "bg-white border border-mainBorder"
                    : "hover:bg-white"
                } px-4 rounded-lg transition-colors duration-200`
              }
            >
              {({ isActive }) => (
                <>
                  {link.icon &&
                    React.cloneElement(link.icon, {
                      className: ` size-8 max-md:size-6 ${
                        isActive ? "text-black" : "text-mainText"
                      } `,
                    })}
                  <span
                    className={`${
                      isActive ? "text-black" : "text-mainText"
                    } text-lg max-md:text-md font-medium`}
                  >
                    {link.name}
                  </span>
                </>
              )}
            </NavLink>

            {link.category && link.category.length > 0 && (
              <ul className="border-l  border-mainBorder ml-7.5 pl-4 ">
                {link.category.map((subLink, subIndex) => (
                  <NavLink
                    key={subIndex}
                    to={subLink.path}
                    className={({ isActive }) =>
                      `flex items-center gap-4 py-2 ${
                        isActive
                          ? "bg-white border border-mainBorder"
                          : "hover:bg-white"
                      } px-4 rounded-lg transition-colors duration-200`
                    }
                  >
                    {({ isActive }) => (
                      <span
                        className={` text-lg max-md:text-md font-medium text-nowrap ${
                          isActive ? "text-black" : "text-mainText"
                        }`}
                      >
                        {subLink.name}
                      </span>
                    )}
                  </NavLink>
                ))}
              </ul>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};
