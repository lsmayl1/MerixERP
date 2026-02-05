import React, { useEffect, useState } from "react";
import { KPI } from "../../components/Metric/KPI";
import { Filters } from "../../assets/Filters";
import { FiltersModal } from "../../components/Filters/FiltersModal";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { Details } from "../../assets/Details";
import {
  useDeleteSaleMutation,
  useGetAllSalesMutation,
  useGetSaleMetricsMutation,
  useLazyPrintSaleReceiptQuery,
} from "../../redux/slices/ApiSlice";
import { SaleDetailsModal } from "../../components/Reports/SaleDetailsModal";
import { DateRange } from "../../components/Date/DateRange";
import { useTranslation } from "react-i18next";
import TrashBin from "../../assets/TrashBin";
import { Cash } from "../../assets/Cash";
import { CreditCard } from "../../assets/CreditCard";
import { PrintIcon } from "../../assets/PrintIcon";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

export const SalesReports = () => {
  const { t } = useTranslation();
  const range = useSelector((state) => state.dateRangeSlice);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [getSales, { refetch }] = useGetAllSalesMutation();
  const [getSaleMetrics] = useGetSaleMetricsMutation();
  const [deleteSale, { Loading: deleteLoading }] = useDeleteSaleMutation();
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const columnHelper = createColumnHelper();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const columns = [
    // columnHelper.accessor("sale_id", {
    //   header: "ID",
    //   headerClassName: "text-center rounded-s-lg bg-gray-100",
    //   cellClassName: "text-center",
    // }),
    columnHelper.accessor("date", {
      header: t("date"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal_amount", {
      header: t("Aralıq məbləğ"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue()} ₼</span>,
    }),
    columnHelper.accessor("discounted_amount", {
      header: t("Endirim Məbləği"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue()} ₼</span>,
    }),
    columnHelper.accessor("total_amount", {
      header: t("Ümumi Məbləğ"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue()} ₼</span>,
    }),
    columnHelper.accessor("transaction_type", {
      header: t("Əməliyyat Növü"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => {
        if (getValue() === "sale") return t("sale");
        if (getValue() === "return") return t("return");
        return getValue();
      },
    }),
    columnHelper.accessor("profit", {
      header: t("profit"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue().toFixed(2)} ₼</span>,
    }),
    columnHelper.accessor("details", {
      header: t("details"),
      headerClassName: "text-center bg-gray-100",
      cell: ({ row }) => (
        <button
          onClick={() => handleDetails(row?.original?.sale_id)}
          className="text-mainText hover:underline"
        >
          <Details />
        </button>
      ),
      cellClassName: "text-center",
    }),
    columnHelper.accessor("delete", {
      header: t("Print / Delete"),
      headerClassName: "text-center bg-gray-100 rounded-e-lg",
      cell: ({ row }) => (
        <div cname="flex gap-2 justify-center w-full items-center gap-4">
          <button
            onClick={() => handlePrintReceipt(row?.original?.sale_id)}
            className="text-mainText hover:underline mr-4"
          >
            <PrintIcon className={"text-black size-6"} />
          </button>
          <button
            onClick={() => handleDeleteSale(row?.original?.sale_id)}
            className="text-mainText hover:underline"
          >
            <TrashBin className={"size-6"} />
          </button>
        </div>
      ),

      cellClassName: "text-center",
    }),
  ];

  const [triggerPrintReceipt] = useLazyPrintSaleReceiptQuery();

  const handlePrintReceipt = async (id) => {
    try {
      await triggerPrintReceipt(id).unwrap();
      toast.success(
        t("receiptPrintedSuccessfully") || "Receipt printed successfully",
      );
    } catch (error) {
      console.error("Failed to print receipt:", error);
      toast.error(t("failedToPrintReceipt") || "Failed to print receipt");
    }
  };

  const handleDetails = (id) => {
    if (!id) return;
    setSelectedSale(id);
    setShowDetailsModal(true);
  };

  const getAllSales = async () => {
    try {
      const res = await getSales(range).unwrap();
      if (res) {
        setData(res);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getMetrics = async () => {
    try {
      const res = await getSaleMetrics(range).unwrap();
      if (res) {
        setMetrics(res);
      }
    } catch (error) {
      console.log(error);
      setMetrics({});
    }
  };

  useEffect(() => {
    if (range.to && range.from) {
      getAllSales();
      getMetrics();
    }
  }, [range]);

  const handleDeleteSale = async (id) => {
    try {
      await deleteSale(id).unwrap();
      await refetch();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-2  w-full h-full relative">
      <ToastContainer />
      <KPI
        data={[
          {
            label: t("revenue"),
            value: metrics.totalRevenue || 0,
          },
          {
            label: t("sale"),
            value: metrics.totalSales || 0,
          },
          {
            label: t("profit"),
            value: metrics.totalProfit || 0,
          },
          {
            label: t("Maya Dəyəri"),
            value: metrics.totalStockCost || 0,
          },
        ]}
      />
      {showDetailsModal && (
        <SaleDetailsModal
          saleId={selectedSale}
          handleClose={setShowDetailsModal}
        />
      )}
      <div className="flex flex-col gap-2 w-full h-full min-h-0  bg-white rounded-lg px-4 py-2 relative">
        <div className="flex gap-2 items-center justify-between w-full px-2">
          <div className="flex items-center gap-6">
            <div className="flex gap-2 items-center text-xl font-semibold">
              <Cash />
              <span>{data?.paymentTotals?.cash}</span>
            </div>
            <div className="flex gap-2 items-center text-xl font-semibold">
              <CreditCard />
              <span>{data?.paymentTotals?.card}</span>
            </div>
          </div>
          <div className="flex  relative ">
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className="border bg-white border-gray-200 rounded-xl text-nowrap px-4 cursor-pointer flex items-center gap-2 py-1"
            >
              <Filters />
              {t("filters")}
            </button>
            {showFiltersModal && (
              <FiltersModal handleClose={setShowFiltersModal} />
            )}
          </div>
        </div>

        <div className="min-h-0 w-full h-full px-2 relative">
          <Table
            columns={columns}
            data={data?.sales}
            // isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
