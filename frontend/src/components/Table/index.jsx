import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
export const Table = ({ data = [], columns = [], isLoading, path }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Varsayılan sayfa başına satır sayısı
      },
    },
  });

  const handleRowClick = (row) => {
    if (path) {
      navigate(`${path}/${row.original.product_id}`);
    }
  };
  return (
    <div className="w-full h-full flex flex-col  min-w-0 min-h-0 rounded-lg justify-between   bg-white gap-1">
      <div className="overflow-y-auto flex flex-col min-h-0  h-full">
        <table className="w-full">
          <thead>
            {table?.getHeaderGroups()?.map((headerGroup) => (
              <tr key={headerGroup.id} className=" ">
                {headerGroup.headers?.map((header, index) => (
                  <th
                    key={header.id}
                    className={`px-4 font-medium text-black max-md:px-2 max-md:py-1 text-nowrap max-md:text-xs py-2 capitalize text-flg ${
                      index == 0
                        ? "text-center rounded-s-lg bg-gray-100"
                        : index == headerGroup.headers.length - 1
                          ? "text-center bg-gray-100 rounded-e-lg"
                          : " bg-gray-100"
                    } ${header.column.columnDef.headerClassName || ""}`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    Loading
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    {t("empty")}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel()?.rows?.map((row) => (
                <tr
                  onClick={() => handleRowClick(row)}
                  key={row.id}
                  className="hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2 max-md:px-2 max-md:py-1 text-flg max-md:text-xs text-nowrap ${
                        cell.column.columnDef.cellClassName || ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
