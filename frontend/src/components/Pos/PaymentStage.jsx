import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Cash } from "../../assets/Cash";
import { CreditCard } from "../../assets/CreditCard";

import Collapse from "../../assets/Collapse";
import Payment from "../../assets/Payment";
export const PaymentStage = ({
  data = {},
  handleBack,
  value = 0,
  setDiscount,
  discount = 0,
  submitSale,
  type = "sale",
}) => {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cash, setCash] = useState("0");
  const [card, setCard] = useState("0");
  const [localDiscount, setLocalDiscount] = useState(Number(discount) || 0);
  const discountValues = [
    {
      label: "0%",
      value: 0,
    },
    {
      label: "10%",
      value: 10,
    },
    {
      label: "15%",
      value: 15,
    },
    {
      label: "20%",
      value: 20,
    },
  ];

  // derived values
  const subtotal = Number(data?.subtotal ?? value ?? 0);
  const activeDiscount =
    typeof setDiscount === "function" ? Number(discount) || 0 : localDiscount;
  const computedDiscountAmount = Number(
    ((subtotal * activeDiscount) / 100).toFixed(2),
  );
  const finalTotal = Number((subtotal - computedDiscountAmount).toFixed(2));
  const paid = Number(cash) + Number(card);
  const change = paid > finalTotal ? (paid - finalTotal).toFixed(2) : "0.00";

  const payments = useMemo(() => {
    const list = [];

    if (Number(cash) > 0) {
      list.push({
        payment_type: "cash",
        amount: (Number(cash) - Number(change)).toFixed(2),
      });
    }

    if (Number(card) > 0) {
      list.push({ payment_type: "card", amount: Number(card).toFixed(2) });
    }

    return list;
  }, [cash, card, change]);

  const applyValue = (key) => {
    const value = paymentMethod === "cash" ? cash : card;
    const setValue = paymentMethod === "cash" ? setCash : setCard;
    // If one method already covers (or exceeds) the final total,
    // don't allow entering values for the other method.
    if (paymentMethod === "card" && Number(cash) >= finalTotal) return;
    if (paymentMethod === "cash" && Number(card) >= finalTotal) return;

    // Clear
    if (key === "C") {
      setValue("0");
      return;
    }

    // Backspace
    if (key === "⌫") {
      setValue(value.length <= 1 ? "0" : value.slice(0, -1));
      return;
    }

    // Only one "."
    if (key === "." && value.includes(".")) return;

    // Max 2 decimals
    if (value.includes(".")) {
      const [, decimals] = value.split(".");
      if (decimals.length >= 2) return;
    }

    const newValue = value === "0" && key !== "." ? key : value + key;
    setValue(newValue);
  };

  const handleAllValue = () => {
    const cardNum = Number(card);
    const cashNum = Number(cash);

    if (paymentMethod === "cash") {
      // If card already covers the total or exceeds it, cash should be 0
      if (cardNum >= finalTotal) {
        setCash("0");
        return;
      }

      // If some card value exists (but less than total), fill remaining with cash
      if (cardNum > 0) {
        setCash((finalTotal - cardNum).toFixed(2).toString());
        return;
      }

      // Otherwise fill cash with full total and clear card
      setCash(finalTotal.toFixed(2).toString());
      setCard("0");
    } else {
      // paymentMethod === 'card'
      // If cash already covers the total or exceeds it, card should be 0
      if (cashNum >= finalTotal) {
        setCard("0");
        return;
      }

      // If some cash value exists (but less than total), fill remaining with card
      if (cashNum > 0) {
        setCard((finalTotal - cashNum).toFixed(2).toString());
        return;
      }

      // Otherwise fill card with full total and clear cash
      setCard(finalTotal.toFixed(2).toString());
      setCash("0");
    }
  };

  const changeDiscount = (val) => {
    const v = Math.max(0, Math.min(100, Number(val) || 0));
    if (typeof setDiscount === "function") setDiscount(v);
    else setLocalDiscount(v);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        applyValue(e.key);
      }

      if (e.key === "." || e.key === ",") {
        applyValue(".");
      }

      if (e.key === "Backspace") {
        applyValue("⌫");
      }

      if (e.key === "Delete") {
        applyValue("C");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, cash, paymentMethod]);

  return (
    <div className="flex flex-col h-full gap-8 ">
      <div className="flex flex-col gap-2">
        <div className="flex items-center py-2 gap-4">
          <Collapse
            className="inline size-6 mr-2 cursor-pointer"
            onClick={handleBack}
          />
          <h1 className="text-md">
            {type === "sale" ? "Ödəniş" : "Qayarılma"}
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded-lg">
        <div className="flex items-center justify-between text-md gap-4 font-medium">
          <span className=" text-nowrap  text-md">Aralıq cəm</span>
          <span className=" text-nowrap">
            {subtotal.toFixed(2) || "0.00"} ₼
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <div className="flex gap-4 items-center ">
            <span className="text-md font-medium">{t("Endirim")}</span>
          </div>
          <span className="text-md font-medium">
            - {computedDiscountAmount.toFixed(2)} ₼
          </span>
        </div>

        <div className="flex items-center justify-between py-2 text-gray-900">
          <span className="text-md">{t("Yekün Məbləğ")}</span>
          <span className="text-md font-semibold">
            {finalTotal.toFixed(2)} ₼
          </span>
        </div>
      </div>
      {/* // Discount */}
      <div className="flex flex-col gap-2">
        <span className="text-md font-medium">Endirim</span>
        <div className="flex gap-2">
          {discountValues?.map((dv, i) => (
            <button
              key={i}
              onClick={() => changeDiscount(dv.value)}
              className={`border ${
                dv.value === activeDiscount
                  ? "bg-[#0f172a] text-white"
                  : "border-gray-200"
              }  w-full rounded-lg p-2  text-sm text-center `}
            >
              {dv.label}
            </button>
          ))}
        </div>
      </div>
      {/* // Payment Method */}
      <div className="flex  justify-end w-full gap-2  rounded-lg   font-medium ">
        <div
          onClick={() => setPaymentMethod("cash")}
          className={`flex w-full gap-8 justify-between items-center border cursor-pointer ${
            paymentMethod === "cash"
              ? "bg-[#0f172a] text-white"
              : "border-gray-200"
          } w-fit p-4 rounded-lg `}
        >
          <div className="flex gap-2 items-center">
            <Cash className="size-6" />
            <h1>{t("cash")}</h1>{" "}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-md">
              {Number(cash).toFixed(2) || "0.00"} ₼
            </span>
          </div>
        </div>

        <div
          onClick={() => setPaymentMethod("card")}
          className={`flex gap-8 items-center border justify-between cursor-pointer w-full ${
            paymentMethod === "card"
              ? "bg-[#0f172a] text-white"
              : "border-gray-200"
          } w-fit p-4 rounded-lg `}
        >
          <div className="flex gap-2 items-center">
            <CreditCard className="size-6 mr-2" />
            <h1>{t("card")}</h1>{" "}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-md">
              {Number(card).toFixed(2) || "0.00"} ₼
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-2md gap-4 font-medium">
        <span className=" text-nowrap  text-md">Qaytarılacağ məbləğ</span>
        <span className=" text-nowrap text-red-600">
          {Number(change).toFixed(2)} ₼
        </span>
      </div>
      <div className="flex flex-col gap-2 h-full ">
        <div className="flex items-end gap-2 w-full h-full">
          <button
            onClick={handleAllValue}
            className="flex justify-center text-md gap-2 items-center border border-gray-200 px-6 h-16 rounded-lg w-full"
          >
            <span className=""> {t("Bütün məbləğ")}</span>
          </button>
          <button
            onClick={() => submitSale(type, payments)}
            disabled={Number(cash) + Number(card) < finalTotal}
            aria-disabled={Number(cash) + Number(card) < finalTotal}
            className={`flex justify-center text-md gap-2 items-center border border-gray-200 px-6 h-16 rounded-lg w-full ${
              Number(cash) + Number(card) < finalTotal
                ? "bg-gray-300 cursor-not-allowed text-[#0f172a]"
                : "bg-[#00a63e] text-white"
            }`}
          >
            <Payment className={"size-6 "} />
            <span className="">
              {" "}
              {type === "sale" ? t("Ödə") : t("return")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
