import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import Edit from "../../assets/Edit";
import { Details } from "../../assets/Details";
import { PrintIcon } from "../../assets/PrintIcon";
import TrashBin from "../../assets/TrashBin";
import { NavLink } from "react-router-dom";

export const productColumn = ({
  t,
  editProduct,
  printProduct,
  deleteProduct,
}) => {
  const columnHelper = createColumnHelper();
  return [
    columnHelper.accessor("product_id", {
      header: "ID",
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("barcode", {
      header: t("barcode"),
      headerClassName: "text-start bg-gray-100",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("unit", {
      header: t("unit"),
      cell: (info) => (
        <span>
          {info.getValue() === "piece" ? t("piece") : info.getValue()}
        </span>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("buyPrice", {
      header: t("buyPrice"),
      cell: (info) => (
        <div className="flex items-center justify-center gap-2">
          <span>{info.getValue()}</span>₼
        </div>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("sellPrice"),
      cell: (info) => (
        <div className="flex items-center justify-center gap-2">
          <span>{info.getValue()}</span>₼
        </div>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("stock.current_stock", {
      header: t("stock"),
      cell: (info) => (
        <div className="flex items-center justify-center gap-2">
          <span>{info.getValue() + " əd"}</span>
        </div>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("action", {
      header: t("editDelete"),
      headerClassName: "text-center rounded-e-lg bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center  gap-6">
          <button
            className="cursor-pointer"
            onClick={() => editProduct(row.original.product_id)}
          >
            <Edit />
          </button>

          <NavLink
            to={`/products/${row.original.product_id}`}
            className="cursor-pointer"
          >
            <Details className="size-5" />
          </NavLink>
          <button
            onClick={() => printProduct(row.original.barcode)}
            className="cursor-pointer text-black"
          >
            <PrintIcon className={"size-6"} />
          </button>
          {/* <button
            className="cursor-pointer"
            onClick={() => deleteProduct(row.original.product_id)}
          >
            <TrashBin className="size-5" />
          </button> */}
        </div>
      ),
      enableSorting: false, // Action sütunu için sıralamayı devre dışı bırak
      enableColumnFilter: false, // Action sütunu için filtrelemeyi devre dışı bırak
    }),
  ];
};
