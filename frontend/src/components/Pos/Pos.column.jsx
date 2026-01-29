import { createColumnHelper } from "@tanstack/react-table";
import { QtyInput } from "../QtyInput";
import TrashBin from "../../assets/TrashBin";

export const PosColumn = ({ t, handleChangeQty, removeProduct }) => {
  const columnHelper = createColumnHelper();
  return [
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start rounded-s-lg bg-gray-100",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("price"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => <span>{row.original?.sellPrice?.toFixed(2)} ₼</span>,
    }),
    columnHelper.accessor("quantity", {
      header: t("quantity"),
      cell: ({ row }) => (
        <QtyInput
          qty={row.original.quantity}
          barcode={row.original.barcode}
          handleQty={handleChangeQty}
          allign={"justify-center"}
        />
      ),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal", {
      header: t("subtotal"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div>
          <span>{row.original?.subtotal?.toFixed(2)} ₼</span>
        </div>
      ),
    }),
    columnHelper.accessor("action", {
      header: t("delete"),
      headerClassName: "text-center rounded-e-lg bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <button onClick={() => removeProduct(row.original.barcode)}>
          <TrashBin className="size-6 text-red-500" />
        </button>
      ),
    }),
  ];
};
