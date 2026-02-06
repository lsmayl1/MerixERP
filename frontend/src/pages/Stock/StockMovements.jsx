import React, { useEffect, useState } from "react";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Plus } from "../../assets/Buttons/Plus";
import { StockMovementModal } from "../../components/StockMovement/StockMovementModal";
import {
  useCreateStockMovementMutation,
  useDeleteStockMovementMutation,
  useGetStockMovementsMutation,
} from "../../redux/slices/StockMovementsSlice";
import TrashBin from "../../assets/Buttons/TrashBin";
import { DateRange } from "../../components/Date/DateRange";

export const StockMovements = () => {
  const { t } = useTranslation();
  const [getStockMovements] = useGetStockMovementsMutation();
  const [createStockTransaction] = useCreateStockMovementMutation();
  const [deleteStockTransaction] = useDeleteStockMovementMutation();
  const columnHelper = createColumnHelper();
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [range, setRange] = useState({
    to: "",
    range: "",
  });
  const columns = [
    columnHelper.accessor("transaction_id", {
      header: "ID",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("date", {
      header: "date",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("product_name", {
      header: "name",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("unit_price", {
      header: "price",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: "quantity",
      cellClassName: "text-center",
    }),

    columnHelper.accessor("amount", {
      header: "amount",
      cellClassName: "text-center",
    }),

    columnHelper.accessor("transaction_type", {
      header: "type",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <button
            onClick={() => {
              handleDeleteTransaction(row.original.transaction_id);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <TrashBin className="size-6" />
          </button>
        </div>
      ),
    }),
  ];

  const onSubmit = async (form) => {
    try {
      await createStockTransaction(form).unwrap();
      setShowModal(false);
      getStockTransactions();
    } catch (error) {
      console.error("Error creating stock transaction:", error);
    }
  };

  const getStockTransactions = async () => {
    try {
      const res = await getStockMovements(range).unwrap();
      console.log(res);
      setData(res);
      setRange(range);
    } catch (error) {
      setData([]);
      console.log(error);
    }
  };
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Silinsin ?")) return;
    try {
      await deleteStockTransaction(id);
      getStockTransactions();
    } catch (error) {
      console.log("Error deleting stock transaction:", error);
    }
  };

  useEffect(() => {
    if (range.to && range.from) {
      getStockTransactions();
    }
  }, [range]);
  return (
    <div className="w-full h-full px-4 p-2 rounded-lg flex flex-col gap-2 relative">
      <DateRange handleRange={setRange} />
      {showModal && (
        <StockMovementModal
          onSubmit={onSubmit}
          handleClose={() => setShowModal(false)}
        />
      )}
      <div className="flex flex-col h-full justify-end w-full bg-white p-2 rounded-lg gap-2 ">
        <div className="flex justify-end items-center w-full">
          <button
            onClick={() => setShowModal(true)}
            className="border  bg-white border-gray-200 rounded-xl text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0"
          >
            <Plus className="max-md:size-5" />
            {t("createTransaction")}
          </button>
        </div>

        <div className=" w-full h-full rounded-lg  bg-white">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
};
