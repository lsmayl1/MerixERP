import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Logo from "../../../assets/Logo/LogoMain.jsx";
import { useNavigate } from "react-router-dom";
import LogoName from "../../../assets/Logo/LogoName.jsx";
export const CashierLogin = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const buttons = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "", "0", "⌫"];
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const applyValue = (btn) => {
    if (btn === "⌫") {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (inputValue.length >= 6) {
      return;
    } else {
      setInputValue((prev) => prev + btn);
    }
  };

  useEffect(() => {
    if (inputValue.length === 6) {
      if (inputValue === "191919") {
        navigate("/pos");
      } else {
        setError(true);
        setTimeout(() => {
          setInputValue("");
          setError(false);
        }, 500);
      }
    }
  }, [inputValue, navigate]);

  return (
    <div className="flex  w-full h-screen">
      <div className="w-full  rounded-lg p-4">
        <div className="bg-gray-200 gap-4 w-full h-full rounded-xl flex items-center justify-center">
          <Logo />
          <LogoName />
        </div>
      </div>
      <div className="flex flex-col w-full p-10  justify-center gap-24 items-center ">
        <h1 className="w-full font-medium text-xl">Cashier Login</h1>
        <div className="flex items-center justify-center  gap-4 font-medium flex-col">
          <ul className="flex gap-8 text-3xl">
            {inputValue.split("").map((char, index) => (
              <li
                key={index}
                className={`rounded-full
                ${error ? "border-red-500" : "border-gray-200"}
                border p-8 size-18 flex items-center justify-center`}
              >
                {char}
              </li>
            ))}
            {Array.from({ length: 6 - inputValue.length }).map((_, index) => (
              <li
                className={`rounded-full ${
                  error ? "border-red-500" : "border-gray-200"
                }  border p-8 size-18 flex items-center justify-center`}
              >
                {inputValue.slice(_, index + inputValue.length + 1).length ===
                0 ? (
                  <span className="text-gray-300"></span>
                ) : (
                  ""
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2 w-full justify-center items-center">
          <div className="w-full">
            <div className="grid grid-cols-3 gap-2 ">
              {buttons.map((btn) => (
                <button
                  key={btn}
                  onClick={() => applyValue(btn)}
                  className="h-24 text-2xl font-medium border border-gray-200  rounded hover:bg-gray-300 active:scale-95"
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
