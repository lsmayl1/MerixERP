import React from "react";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";

export const ShiftReport = () => {
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
    }),
    columnHelper.accessor("cashier", {
      header: "Cashier",
    }),
    columnHelper.accessor("open", {
      header: "Open",
    }),
    columnHelper.accessor("close", {
      header: "Close",
    }),
  ];
  return (
    <div className="flex flex-col mt-2 gap-2 w-full h-full min-h-0  bg-white rounded-lg px-4 py-2 relative">
      <div className="min-h-0 w-full h-full  relative">
        <Table
          columns={columns}
          // data={data?.sales}
          // isLoading={isLoading}
        />
      </div>
    </div>
  );
};
