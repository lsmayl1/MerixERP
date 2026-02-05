import React from "react";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";

export const Employee = () => {
  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("Position", {
      header: "Position",
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
    }),
    columnHelper.accessor("action", {
      header: "Action",
    }),
  ];
  return (
    <div className="flex w-full h-full rounded-xl bg-white p-4 flex-col gap-4">
      <div className="w-full flex justify-end">
        <button className="bg-blue-600 text-white p-2 rounded-lg">
          Create User{" "}
        </button>
      </div>
      <div className="p-4">
        <Table columns={columns} />
      </div>
    </div>
  );
};
