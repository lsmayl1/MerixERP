import React, { useEffect, useState } from "react";
import { KPI } from "../../components/Metric/KPI";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  useCreateCashMovementMutation,
  useDeleteCashMovementMutation,
  useGetCashMovementsMutation,
} from "../../redux/slices/CashMovementSlice";
import Edit from "../../assets/Edit";
import TrashBin from "../../assets/TrashBin";
import { Plus } from "../../assets/Plus";
import { TransactionModal } from "../../components/CashMovement/TransactionModal";
import { useTranslation } from "react-i18next";
import { DateRange } from "../../components/Date/DateRange";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

export const CashMovements = () => {
  const { t } = useTranslation();
  const range = useSelector((state) => state.dateRangeSlice);
  const [getCashMovements, { data, refetch }] =
    useGetCashMovementsMutation(range);
  const [createTransaction, { isLoading }] = useCreateCashMovementMutation();
  const [deleteTransaction, { isLoadings }] = useDeleteCashMovementMutation();
  const columnHelper = createColumnHelper();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("date", {
      header: t("date"),
      cellClassName: "text-center",
    }),
    columnHelper.accessor("description", {
      header: t("description"),
      cellClassName: "text-center",
      cell: ({ row }) => (
        <span className="block mx-auto text-center whitespace-pre-wrap break-words max-w-md">
          {row.original.description || "No description"}
        </span>
      ),
    }),
    columnHelper.accessor("amount", {
      header: t("amount"),
      cellClassName: "text-center",
    }),
    columnHelper.accessor("transactionType", {
      header: t("type"),
      cellClassName: "text-center",
      cell: ({ row }) => (
        <span className="block mx-auto text-center">
          {row.original.transactionType === "in" ? t("income") : t("expense")}
        </span>
      ),
    }),

    columnHelper.accessor("actions", {
      header: t("delete"),
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center  gap-2">
          {/* <button
            className="cursor-pointer"
            // onClick={() => handleEditProduct(row.original.product_id)}
          >
            <Edit />
          </button> */}
          <button
            className="cursor-pointer"
            onClick={() => handleDeleteTransaction(row.original.id)}
          >
            <TrashBin className="size-5" />
          </button>
        </div>
      ),
    }),
  ];

  const handleCreateTransaction = async (data) => {
    try {
      const transaction = await createTransaction(data);
      console.log(transaction);
      setShowTransactionModal(false);
      getCashMovements(range);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Silinsin ?")) {
      return;
    }
    try {
      await deleteTransaction(id);
      await refetch();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (range.from && range.to) {
      getCashMovements(range);
    }
  }, [range]);

  return (
    <div className="w-full h-full flex flex-col  gap-2 relative">
      <ToastContainer />
      {showTransactionModal && (
        <TransactionModal
          handleClose={() => setShowTransactionModal(false)}
          onSubmit={handleCreateTransaction}
        />
      )}
      <KPI
        data={[
          { label: t("todayRevenue"), value: data?.totalRevenue },
          { label: t("todayIncome"), value: data?.todayIncome },
          { label: t("todayExpense"), value: data?.todayExpense },
          { label: t("todayTotal"), value: data?.todayTotal },
        ]}
      />
      <div className="w-full h-full flex flex-col gap-2 p-2 bg-white rounded-lg">
        <div className="flex gap-2 items-center justify-end">
          {/* <div className="flex items-center gap-2 w-full relative">
            <input
              type="text"
              placeholder="Search by name or barcode"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="px-12 w-full max-md:px-8  py-2 rounded-lg bg-white focus:outline-blue-500 "
            />
            <SearchIcon className="absolute left-2 max-md:size-5" />
          </div> */}

          <button
            onClick={() => setShowTransactionModal(true)}
            className="border bg-white border-gray-200 rounded-xl text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0"
          >
            <Plus className="max-md:size-5" />
            {t("createTransaction")}
          </button>
        </div>
        <Table columns={columns} data={data?.transactions} />
      </div>
    </div>
  );
};
