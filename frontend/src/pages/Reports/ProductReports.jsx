import React, { useEffect, useState } from "react";
import { KPI } from "../../components/Metric/KPI";
import { Filters } from "../../assets/Filters";
import { FiltersModal } from "../../components/Filters/FiltersModal";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { DateRange } from "../../components/Date/DateRange";
import {
  useGetProductSoldMetricsMutation,
  useGetProductsReportMutation,
} from "../../redux/slices/ApiSlice";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

export const ProductReports = () => {
  const { t } = useTranslation();
  const [getProductMetric] = useGetProductSoldMetricsMutation();
  const [metricData, setMetricData] = useState({});
  const [data, setData] = useState([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const columnHelper = createColumnHelper();
  const range = useSelector((state) => state.dateRangeSlice);
  const [getProductsReport] = useGetProductsReportMutation();
  const columns = [
    columnHelper.accessor("productName", {
      header: t("product"),
      headerClassName: "text-start rounded-s-lg bg-gray-100",
      cellClassName: "text-start",
    }),

    columnHelper.accessor("totalSold", {
      header: t("quantitySold"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("unit", {
      header: t("unit"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: (info) => (
        <span>{info.getValue() === "pcs" ? t("piece") : info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("totalRevenue", {
      header: t("revenue"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("profit", {
      header: t("profit"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("profitMargin", {
      header: t("profitMargin"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
  ];

  const getReports = async () => {
    try {
      const res = await getProductsReport(range).unwrap();
      if (res) {
        setData(res);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getProductsReports = async () => {
    try {
      const res = await getProductMetric(range).unwrap();
      if (res) {
        setMetricData(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (range.from && range.to) {
      getReports(range);
      getProductsReports(range);
    }
  }, [range]);

  return (
    <div className="flex flex-col gap-2  w-full h-full">
      <ToastContainer />

      <KPI
        data={[
          {
            label: t("stockCost"),
            value: metricData?.totalStockCost,
          },
          {
            label: t("quantitySold"),
            value: metricData?.quantitySold,
          },
        ]}
      />
      <div className="flex flex-col gap-2 w-full h-full min-h-0  bg-white rounded-lg px-4 py-2 relative">
        <div className="flex gap-2 items-center justify-end">
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

        <div className="min-h-0 w-full px-2">
          <Table
            columns={columns}
            data={data?.products}
            // isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
