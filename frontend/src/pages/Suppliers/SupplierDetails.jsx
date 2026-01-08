import React, { useState } from "react";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { t } from "i18next";
import { useParams } from "react-router-dom";
import {
  useCreateSupplierInvoiceMutation,
  useCreateSupplierTransactionMutation,
  useDeleteSupplierTransactionMutation,
  useGetSupplierByIdQuery,
  useGetSupplierInvoiceMutation,
  useGetSupplierTransactionsByIdQuery,
  useUpdateSupplierInvoiceMutation,
} from "../../redux/slices/SupplierSlice";
import { SupplierInvoiceModal } from "../../components/Supplier/TransactionModal";
import { Plus } from "../../assets/Plus";
import TrashBin from "../../assets/TrashBin";
import { DebtModal } from "../../components/Supplier/DebtModal";
import { Invoice } from "../../assets/Navigation/Invoice";
import { InvoiceView } from "../../components/Supplier/InvoiceView";
import Receipt from "../../assets/Navigation/Receipt";
import Edit from "../../assets/Edit";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { updateMode } from "../../redux/supplierTransactions/supplierTransaction.slice";

export const SupplierDetails = () => {
  const { id } = useParams();
  const { mode } = useSelector((state) => state.supplierTransaction);
  const { data } = useGetSupplierByIdQuery(id);
  const [getSupplierInvociceData] = useGetSupplierInvoiceMutation();
  const dispatch = useDispatch();
  const { data: transactions, refetch } =
    useGetSupplierTransactionsByIdQuery(id);
  const [supplierInvoiceData, setSupplierInvoiceData] = useState(null);
  const [createTransaction] = useCreateSupplierTransactionMutation();
  const [deleteTransaction] = useDeleteSupplierTransactionMutation();
  const [createSupplierInvoice] = useCreateSupplierInvoiceMutation();

  const [InvoiceData, setInvoiceData] = useState({});
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("date", {
      header: t("date"),
      cellClassName: "text-center",
    }),

    columnHelper.accessor("amount", {
      header: t("amount"),
      cellClassName: "text-center",
    }),
    columnHelper.accessor("type", {
      header: t("type"),
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{t(getValue())}</span>,
    }),
    columnHelper.accessor("payment_method", {
      header: t("paymentMethod"),
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{t(getValue())}</span>,
    }),
    columnHelper.accessor("invoice", {
      header: t("Invoice"),
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center  gap-4">
          <button
            className="cursor-pointer"
            onClick={() => handleShowInvoice(row.original.id)}
          >
            <Invoice className="size-5" />
          </button>
        </div>
      ),
      enableSorting: false, // Action sütunu için sıralamayı devre dışı bırak
      enableColumnFilter: false, // Action sütunu için filtrelemeyi devre dışı bırak
    }),
    columnHelper.accessor("edit", {
      header: t("edit"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center  gap-4">
          <button
            className="cursor-pointer"
            onClick={() => handleUpdateTransaction(row.original.id)}
          >
            <Edit className="size-5" />
          </button>
        </div>
      ),
      enableSorting: false, // Action sütunu için sıralamayı devre dışı bırak
      enableColumnFilter: false, // Action sütunu için filtrelemeyi devre dışı bırak
    }),
    columnHelper.accessor("action", {
      header: t("delete"),
      headerClassName: "text-center rounded-e-lg bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center  gap-4">
          <button
            className="cursor-pointer"
            onClick={() => handleDeleteTransaction(row.original.id)}
          >
            <TrashBin className="size-5" />
          </button>
        </div>
      ),
      enableSorting: false, // Action sütunu için sıralamayı devre dışı bırak
      enableColumnFilter: false, // Action sütunu için filtrelemeyi devre dışı bırak
    }),
  ];
  const [showModal, setShowModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const [updateInvoice] = useUpdateSupplierInvoiceMutation();

  const handleTransactionSubmit = async (data) => {
    try {
      if (!data.amount || data.amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // ✅ unwrap kullanıyoruz ki RTK Query hata fırlatsın
      await createTransaction({
        ...data,
        supplier_id: id,
      }).unwrap();

      setShowDebtModal(false);
      await refetch();
    } catch (error) {
      // unwrap error’da burası çalışır
      setShowDebtModal(true);
      console.error("Error creating transaction:", error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransaction(transactionId).unwrap();
      await refetch();
    } catch (error) {
      await refetch();
      console.log(error);
    }
  };

  const handleUpdateTransaction = async (transactionId) => {
    try {
      dispatch(updateMode("update"));
      const supplierInvoiceData = await getSupplierInvociceData({
        supplier_id: id,
        transaction_id: transactionId,
      }).unwrap();
      setInvoiceData(supplierInvoiceData);
      setShowModal(true);
    } catch (error) {
      toast(error);
    }
  };

  const handleCreateSupplierInvoice = async (data) => {
    // if(data.update){

    // }
    try {
      if (mode === "create") {
        await createSupplierInvoice({ ...data, supplier_id: id });
      } else {
        await updateInvoice({
          transaction_id: data.transaction_id,
          data: {
            ...data,
            supplier_id: id,
          },
        }).unwrap();
      }
      dispatch(updateMode("create"));
      setShowModal(false);
      await refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowInvoice = async (transactionId) => {
    try {
      if (!transactionId) {
        throw new Error("Transaction ID is required to fetch invoice data");
      }
      const supplierInvoiceData = await getSupplierInvociceData({
        supplier_id: id,
        transaction_id: transactionId,
      }).unwrap();

      if (!supplierInvoiceData || !supplierInvoiceData.transaction) {
        throw new Error("No invoice data found for this transaction");
      }
      setSupplierInvoiceData(supplierInvoiceData);
      setShowInvoice(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4 w-full h-full relative">
      <div className="items-center flex gap-12  w-full  justify-between ">
        <h1 className="text-3xl font-semibold text-nowrap">{data?.name}</h1>
        <div className="bg-white w-1/5  h-full justify-between px-4 py-4  rounded-lg flex flex-col gap-2">
          <label className="text-mainText text-nowrap max-md:text-xs font-medium capitalize">
            Cemi Borc
          </label>
          <span className="text-3xl font-semibold max-md:text-2xl text-nowrap">
            {transactions?.totalAmount || 0}
          </span>
        </div>
      </div>
      <div className="flex flex-col bg-white w-full h-full  rounded-lg  relative ">
        {showInvoice && (
          <InvoiceView
            handleClose={() => {
              setShowInvoice(false);
            }}
            data={supplierInvoiceData}
          />
        )}
        {showModal && (
          <SupplierInvoiceModal
            handleClose={() => setShowModal(false)}
            onSubmit={handleCreateSupplierInvoice}
            invoiceData={InvoiceData}
          />
        )}
        {showDebtModal && (
          <DebtModal
            handleClose={() => setShowDebtModal(false)}
            onSubmit={handleTransactionSubmit}
          />
        )}
        <div className="py-2 px-4 flex justify-end items-center gap-4">
          <button
            onClick={() => setShowDebtModal(true)}
            className="border bg-white border-gray-200 rounded-xl text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0"
          >
            <Plus className="max-md:size-5" />
            {t("Odenis et")}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="border bg-white border-gray-200 rounded-xl text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0"
          >
            <Receipt className="max-md:size-5 size-6" />
            {t("Faktura Əlavə Et")}
          </button>
        </div>
        <div className="flex flex-col gap-4 px-4">
          <Table
            columns={columns}
            data={
              transactions?.transactions.length > 0
                ? transactions?.transactions
                : []
            }
          />
        </div>
      </div>
    </div>
  );
};
