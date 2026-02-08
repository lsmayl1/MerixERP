import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../../../assets/Logo/LogoMain.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import LogoName from "../../../assets/Logo/LogoName.jsx";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../redux/slices/auth/authService.js";
import Collapse from "../../../assets/Navigation/Collapse.jsx";
import { useCashierLoginMutation } from "../../../redux/slices/auth/AuthSlice.jsx";
import { toast, ToastContainer } from "react-toastify";
import { useGetAllUsersQuery } from "../../../redux/slices/user/userApiSlice.jsx";

export const CashierLogin = () => {
  const { t } = useTranslation();
  const data = [
    {
      name: "ismo",
    },
    {
      name: "elso",
    },
    {
      name: "refo",
    },
    {
      name: "umwe",
    },
  ];
  const [dropDown, setDropDown] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState({});
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch();
  const { data: users } = useGetAllUsersQuery();
  const [cashierLogin] = useCashierLoginMutation();
  const buttons = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "", "0", "⌫"];
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Auto-login when 6 digits are entered
  useEffect(() => {
    if (inputValue.length === 6) {
      handleLogin();
    }
  }, [inputValue]);

  const applyValue = async (btn) => {
    if (btn === "⌫") {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (inputValue.length < 6) {
      setInputValue((prev) => prev + btn);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await cashierLogin({
        userId: selectedCashier.id,
        password: inputValue,
      }).unwrap();
      (dispatch(
        setCredentials({
          token: user.data.token,
          refreshToken: user.data.refreshToken,
          role: "cashier",
        }),
      ),
        navigate("/pos"));
    } catch (error) {
      toast.error(error.data.message);
      console.log(error);
    }
  };
  return (
    <div className="flex  w-full h-screen">
      <div className="w-full  rounded-lg p-4">
        <ToastContainer />
        <div className="bg-gray-200  w-full h-full rounded-xl flex items-center justify-center">
          <img
            src={"./CashierLogin.jpg"}
            alt=""
            className="w-full h-full rounded-xl"
          />
        </div>
      </div>
      <div className="flex flex-col w-full p-10  justify-between items-center ">
        <div className="flex justify-between gap-4 w-full flex-col items-center">
          <div className="flex justify-between w-full">
            <h1 className="w-full font-medium text-nowrap text-xl">
              Cashier Login
            </h1>
            <NavLink to={"/login"} className=" font-medium text-nowrap text-xl">
              Admin Login
            </NavLink>
          </div>
          <div className="flex flex-col w-1/2 relative">
            <div className="border flex items-center justify-between px-4 p-2 border-mainBorder rounded-lg w-full text-nowrap gap-4">
              {selectedCashier.username || "Select Cashier"}
              <button onClick={() => setDropDown(!dropDown)}>
                <Collapse className={"rotate-270 size-6"} />
              </button>
            </div>
            {dropDown && users.length > 0 && (
              <div className="bg-white border absolute w-full top-12 border-mainBorder rounded-lg flex flex-col gap-2 ">
                {users?.map((dt, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      setSelectedCashier(dt);
                      setDropDown(false);
                    }}
                    className="hover:bg-gray-300 hover:text-white cursor-pointer p-2 rounded-lg"
                  >
                    {dt.username}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center  gap-4 font-medium flex-col">
          <ul className="flex gap-4 text-3xl">
            {inputValue.split("").map((char, index) => (
              <li
                key={index}
                className={`rounded-full
                ${error ? "border-red-500" : "border-gray-200"}
                border p-6 size-10 text-md flex items-center justify-center`}
              >
                {char}
              </li>
            ))}
            {Array.from({ length: 6 - inputValue.length }).map((_, index) => (
              <li
                key={index}
                className={`rounded-full ${
                  error ? "border-red-500" : "border-gray-200"
                }  border p-6 text-md size-10 flex items-center justify-center`}
              >
                {inputValue.slice(_, index + inputValue.length + 1).length ===
                  0 && <span key={index} className="text-gray-300"></span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 w-full justify-center items-center">
          <div className="w-full">
            <div className="grid grid-cols-3 gap-2 ">
              {buttons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => applyValue(btn)}
                  className="h-18 text-xl font-medium border border-gray-200  rounded hover:bg-gray-300 "
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
