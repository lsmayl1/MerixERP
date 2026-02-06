import React from "react";
import { Table } from "../Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useGetSaleByIdQuery } from "../../redux/slices/ApiSlice";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../assets/Buttons/Close";

export const SaleDetailsModal = ({ saleId, handleClose }) => {
  const { t } = useTranslation();
  const { data } = useGetSaleByIdQuery(saleId, {
    skip: !saleId,
  });
  const columnHelper = createColumnHelper();
  const column = [
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("price"),
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: t("quantity"),
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal", {
      header: t("subtotal"),
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
  ];

  return (
    <div className="flex absolute  w-full h-full   items-center justify-center z-50">
      <div className="flex bg-white min-w-1/3 min-h-0 top-0 rounded-lg shadow-lg flex-col gap-10 p-6">
        <div>
          <div
            className="flex justify-end items-center cursor-pointer w-full"
            onClick={() => handleClose(false)}
          >
            <CloseIcon className={"size-6 text-gray-500"} />
          </div>
          <h1 className="w-full text-center font-semibold text-2xl">
            {t("Satış Qaiməsi")}
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between pb-4 border-b border-mainBorder ">
            <div className="flex flex-col ">
              <h1 className="text-lg font-semibold text-mainText">
                {t("Satış ID")}
              </h1>
              <span className="text-lg  ">#{data?.saleId.slice(0, 15)}</span>
            </div>
            <div className="flex flex-col ">
              <h1 className="text-lg font-semibold text-end text-mainText">
                {t("date")}
              </h1>
              <span className="text-lg">{data?.date}</span>
            </div>
          </div>
          <div className="min-h-0 max-h-[200px] overflow-auto ">
            <Table columns={column} data={data?.details} pagination={false} />
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-2 ">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-mainText">Aralıq məbləğ</span>
            <span>{data?.subtotalAmount}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-b border-mainBorder pb-2">
            <span className="text-mainText">{t("Endirim")}</span>
            <span>{data?.discountedAmount}</span>
          </div>
          <div className="flex justify-between items-center  ">
            <span className="text-lg text-mainText font-semibold">
              Yekun məbləğ
            </span>
            <span className="text-lg font-semibold">{data?.totalAmount}</span>
          </div>
          <div className="flex flex-col text-lg font-semibold pt-8">
            <span className="">Ödəniş üsulu</span>
            {data?.payments.map((payment) => (
              <div className="flex justify-between ">
                <span className="text-mainText">
                  {" "}
                  {payment?.payment_type === "cash" ? t("cash") : t("card")}
                </span>

                <span>{payment.amount + ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
