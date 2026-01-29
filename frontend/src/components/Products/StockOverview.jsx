import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../Table";
import { useGetBestSellersQuery } from "../../redux/slices/ApiSlice";

export const StockOverview = () => {
  const columnHelper = createColumnHelper();
  const { data } = useGetBestSellersQuery();
  const columns = [
    columnHelper.accessor("name", {
      header: "Mehsul",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("sold", {
      header: "Satilan Miqdar",
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("stock", {
      header: "Qaliq",
      headerClassName: "text-start",
    }),
  ];
  return (
    <div className="overflow-auto min-h-0 h-full min-w-0 overflow-x-hidden">
      <Table columns={columns} data={data} />
    </div>
  );
};
