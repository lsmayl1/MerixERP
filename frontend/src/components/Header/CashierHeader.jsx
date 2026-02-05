import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../redux/slices/auth/authService";
import Reports from "../../assets/Sidebar/Reports";
import { Kart } from "../../assets/Sidebar/Kart";
import Logo from "../../assets/Logo/LogoMain";
import LogoName from "../../assets/Logo/LogoName";
import { Logout } from "../../assets/Logout";

export const CashierHeader = ({ className }) => {
  const { t } = useTranslation();
  const role = "admin";
  const path = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const links = [
    {
      name: t("reports"),
      blank: false,
      icon: <Reports />,
      path: "reports",
      roles: ["admin", "user"],
    },

    {
      name: t("pos"),
      blank: true,
      path: "pos",
      icon: <Kart />,
      roles: ["admin", "user"],
    },
  ];
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <div
      className={`max-md:absolute bg-white h-fit items-center border-r-gray-100 py-4 border-r z-50 gap-8 max-md:left-0 max-md:bg-white  flex  px-4 ${className}
      `}
    >
      <NavLink
        to={"/"}
        className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}
      >
        <Logo className="size-10" />
        {!collapsed && <LogoName className="text-black w-14" />}
      </NavLink>
      <ul className={`flex   gap-2 w-full`}>
        {links
          .filter((item) => item.roles.includes(role))
          .map((link, index) => (
            <div className="flex flex-col gap-1  " key={index}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 border-mainBorder py-2 ${
                    isActive
                      ? "bg-[#0f172a] border border-mainBorder"
                      : "hover:bg-white"
                  } px-2 rounded-lg transition-colors duration-200`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.icon &&
                      React.cloneElement(link.icon, {
                        className: ` size-7 max-md:size-6 ${
                          !isActive ? "text-black" : "text-white"
                        } `,
                      })}
                    {!collapsed && (
                      <span
                        className={`${
                          !isActive ? "text-black" : "text-white"
                        } text-md max-md:text-md font-medium text-nowrap`}
                      >
                        {link.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {link.category && link.category.length > 0 && !collapsed && (
                <ul className="pl-4 ">
                  {link.category.map((subLink, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={subLink.path}
                      className={({ isActive }) =>
                        `flex items-center gap-4 py-2 ${
                          isActive
                            ? "bg-gray-200 border border-mainBorder"
                            : "hover:bg-white"
                        } px-4 rounded-lg transition-colors duration-200`
                      }
                    >
                      {({ isActive }) =>
                        !collapsed && (
                          <span
                            className={` text-md max-md:text-md font-medium text-nowrap ${
                              !isActive ? "text-black" : "text-[#0f172a]"
                            }`}
                          >
                            {subLink.name}
                          </span>
                        )
                      }
                    </NavLink>
                  ))}
                </ul>
              )}
            </div>
          ))}
      </ul>
      <div className="h-full flex items-end ">
        <button
          onClick={handleLogout}
          className=" bg-red-500 text-white text-sm p-2 rounded-lg text-nowrap flex gap-2 items-center"
        >
          <Logout />
        </button>
      </div>
    </div>
  );
};
