import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { Table } from "../Table";
import { CloseIcon } from "../../assets/Buttons/Close";
import { useTranslation } from "react-i18next";

export const InvoiceView = ({ handleClose, data }) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("unit", {
      header: "Unit",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("total", {
      header: "amount",
      cellClassName: "text-center",
    }),
  ];
  if (!data || !data.transaction || !data.details) {
    return;
  }
  return (
    <div className="flex absolute  w-full h-full   items-center justify-center z-50">
      <div className="flex bg-white min-w-1/2 h-full gap-2 rounded-lg shadow-lg flex-col  pt-2 pb-4 px-6">
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2  font-semibold rounded-lg"
          >
            <CloseIcon className={"size-6"} />
          </button>
        </div>
        <h1 className="w-full text-center font-semibold text-xl">
          {data?.transaction.type === "purchase"
            ? t("Alım Qaiməsi ")
            : t("Qaytarılma Qaiməsi ")}
        </h1>
        <div className="flex justify-between pb-4 border-b border-mainBorder ">
          <div className="flex flex-col ">
            <h1 className="text-lg font-semibold text-mainText">
              {t("Qaimə ID")}
            </h1>
            <span className="text-lg  ">#{data?.transaction?.id}</span>
          </div>
          <div className="flex flex-col ">
            <h1 className="text-lg font-semibold text-end text-mainText">
              {t("date")}
            </h1>
            <span className="text-lg">{data?.transaction?.date}</span>
          </div>
        </div>
        <div className="min-h-0 h-full  overflow-auto ">
          <Table columns={columns} data={data?.details} pagination={false} />
        </div>
        <div className="flex justify-end gap-4 items-center">
          <span className="text-xl font-semibold">{t("Yekun Məbləğ : ")}</span>
          <span className="text-xl font-semibold">
            {data?.transaction?.amount || 0.0}
          </span>
        </div>
      </div>
    </div>
  );
};
