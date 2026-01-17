import React, { useEffect, useState } from "react";
import { KPI } from "../components/Metric/KPI.jsx";
import { Table } from "../components/Table/index.jsx";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DateRange } from "../components/Date/DateRange.jsx";
import {
  useGetDailyProfitQuery,
  useGetDailyRevenueQuery,
  useGetDashboardMetricsMutation,
} from "../redux/slices/ApiSlice.jsx";
import { LineChart } from "../components/Charts/LineChart.jsx";
import { StockOverview } from "../components/Products/StockOverview.jsx";

export const Dashboard = () => {
  const { t } = useTranslation();
  const [timeframeVariable, setTimeframeVariable] = useState([
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ]);
  const [timeframe, setTimeframe] = useState("daily");

  const { data: Revenue } = useGetDailyRevenueQuery(timeframe, {
    skip: !timeframe,
  });
  const { data: Profit } = useGetDailyProfitQuery(timeframe, {
    skip: !timeframe,
  });
  const [getMetrics] = useGetDashboardMetricsMutation();
  const [metricData, setMetricData] = useState({});
  const [range, setRange] = useState({
    from: "",
    to: "",
  });

  const getDashboardMetrics = async () => {
    try {
      const res = await getMetrics(range).unwrap();
      if (res) setMetricData(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (range.to && range.from) getDashboardMetrics();
  }, [range]);

  return (
    <div className="w-full h-full  flex flex-col pr-2 gap-2 overflow-auto ">
      <DateRange handleRange={setRange} />
      <div className="flex items-center gap-2 w-full">
        <KPI
          data={[
            {
              label: t("revenue"),
              value: metricData?.totalRevenue,
            },
            {
              label: t("profit"),
              value: metricData?.totalProfit,
            },
            {
              label: t("sale"),
              value: metricData?.totalSales,
            },
            {
              label: t("Ümumi Anbar Dəyəri"),
              value: metricData?.totalStockCost,
            },
          ]}
        />
      </div>
      <div className="flex flex-col  bg-white w-full justify-end  p-4 h-full gap-4  rounded-lg  ">
        <div className="flex justify-end gap-6  items-center ">
          {timeframeVariable.map((item, index) => (
            <button
              key={index}
              onClick={() => setTimeframe(item.value)}
              className={`${
                timeframe === item.value ? "bg-blue-700 text-white" : "bg-white"
              } border border-mainBorder px-4 py-1 rounded-lg`}
            >
              {t(item.value)}
            </button>
          ))}
        </div>

        <div className="w-full min-h-[400px] h-full min-w-0 transition-width duration-200  ">
          <LineChart data={Revenue?.data} />
        </div>
      </div>
      {/* <div className="flex flex-col bg-white w-full justify-end  p-4 h-full  rounded-lg  ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex  items-center   gap-4">
            <h1 className=" font-medium text-xl text-mainText">
              Ortalama Qazanc
            </h1>
            <span className="text-3xl text-end font-semibold ">
              {Profit?.average}
            </span>
          </div>
          <div className="flex justify-end gap-6  items-center ">
            {timeframeVariable.map((item, index) => (
              <button
                key={index}
                onClick={() => setTimeframe(item.value)}
                className={`${
                  timeframe === item.value
                    ? "bg-blue-700 text-white"
                    : "bg-white"
                } border border-mainBorder px-4 py-1 rounded-lg`}
              >
                {t(item.value)}
              </button>
            ))}
          </div>
        </div>
        <LineChart valueKey={"profit"} data={Profit?.data} />
      </div> */}

      <div className="w-full flex flex-col gap-4 rounded-lg p-4 bg-white h-1/2">
        <h1 className="text-2xl">En cox satilanlar</h1>
        <div className=" overflow-auto">
          <StockOverview />
        </div>
      </div>
    </div>
  );
};
