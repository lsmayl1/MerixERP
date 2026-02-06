import React, { useEffect, useState } from "react";
import { KPI } from "../components/Metric/KPI.jsx";
import { useTranslation } from "react-i18next";
import { DateRange } from "../components/Date/DateRange.jsx";
import {
  useGetDailyRevenueQuery,
  useGetDashboardMetricsMutation,
} from "../redux/slices/ApiSlice.jsx";
import { LineChart } from "../components/Charts/LineChart.jsx";
import { StockOverview } from "../components/Products/StockOverview.jsx";
import { useSelector } from "react-redux";

export const Dashboard = () => {
  const { t } = useTranslation();
  const [timeframeVariable] = useState([
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ]);
  const [timeframe, setTimeframe] = useState("daily");

  const { data: Revenue } = useGetDailyRevenueQuery(timeframe, {
    skip: !timeframe,
  });
  const [getMetrics] = useGetDashboardMetricsMutation();
  const [metricData, setMetricData] = useState({});
  const range = useSelector((state) => state.dateRangeSlice);

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
    <div className="w-full h-screen  flex flex-col pr-2 gap-2 min-h-0  ">
      <div className="bg-white rounded-lg p-4 flex gap-4 items-center">
        <DateRange />
      </div>
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
      <div className="flex w-full gap-2 h-full min-h-[400px]  overflow-hidden">
        <div className="flex flex-col flex-2  bg-white w-full justify-end  p-2 h-full gap-4  rounded-lg  ">
          <div className="flex justify-between gap-2  items-center ">
            <div className="w-full text-mainText font-medium">Dövriyyə</div>
            {timeframeVariable.map((item, index) => (
              <button
                key={index}
                onClick={() => setTimeframe(item.value)}
                className={`${
                  timeframe === item.value
                    ? "bg-blue-700 text-white"
                    : "bg-white"
                } border text-xs border-mainBorder px-4 py-1 rounded-lg`}
              >
                {t(item.value)}
              </button>
            ))}
          </div>

          <div className="w-full  h-full min-w-0 min-h-0  transition-width duration-200 relative">
            <LineChart data={Revenue?.data} />
          </div>
        </div>
        <div className="w-full flex flex-1  flex-col gap-2 min-h-0 rounded-lg p-2 bg-white ">
          <h1 className="text-md text-mainText font-medium">
            Azalan məhsullar
          </h1>
          <div className="overflow-auto">
            <StockOverview />
          </div>
        </div>
      </div>
      <div className="bg-white w-full h-full rounded-lg p-2">
        <h1 className="text-lg text-mainText font-medium">Son ödənişlər</h1>
      </div>
      <div className="bg-white w-full h-full rounded-lg p-2">
        <h1 className="text-lg text-mainText font-medium">Son ödənişlər</h1>
      </div>
    </div>
  );
};
