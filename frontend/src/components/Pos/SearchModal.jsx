import React, { useEffect, useState } from "react";
import { Plus } from "../../assets/Buttons/Plus";
import { SearchIcon } from "../../assets/Navigation/SearchIcon";
import { Table } from "../Table";
import { createColumnHelper } from "@tanstack/react-table";
import { Kart } from "../../assets/Sidebar/Kart";

export const SearchModal = ({
  data,
  handleAdd,
  setQuery,
  query,
  barcodeRef,
  modalRef,
  handleShortCut,
}) => {
  const searchInput = React.useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [input, setInput] = useState("");
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("name", {
      header: "Mehsul",
    }),
    columnHelper.accessor("stock.current_stock", {
      header: "Stok",
      cellClassName: "text-center",
      cell: (info) => <span>{info.getValue() + " əd"}</span>,
    }),
    columnHelper.accessor("action", {
      header: "Əlavə et",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex gap-4 w-full items-center justify-center ">
          {handleShortCut && (
            <button
              onClick={() =>
                handleShortCut(row.original.product_id, row.original.procuct_id)
              }
              className="border border-mainBorder rounded-lg p-1 bg-white"
            >
              <Plus className={"size-5"} />
            </button>
          )}
          <button
            onClick={() => handleAdd(row.original.barcode, "increase")}
            className="border border-mainBorder rounded-lg p-1 bg-white"
          >
            <Kart className={"size-5"} />
          </button>
        </div>
      ),
    }),
  ];
  const handleQuery = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      setQuery(input);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === "k") {
        e.preventDefault();
        searchInput.current?.focus();
      } else if (key === "escape") {
        setQuery("");
        setFocusedIndex(-1);
        barcodeRef.current?.focus();
      } else if (key === "arrowdown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
      } else if (key === "arrowup") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (
        key === "enter" &&
        focusedIndex >= 0 &&
        query.trim().length > 0
      ) {
        if (data[focusedIndex]) {
          handleAdd(data[focusedIndex].barcode, "increase");
        }
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [data, focusedIndex]);

  return (
    <div className="flex flex-col relative  bg-white w-full p-2 rounded-lg gap-2">
      <div className="flex items-center  relative">
        <input
          type="text"
          ref={searchInput}
          placeholder="Məhsul axtar..."
          className="border border-mainBorder rounded-lg py-2 px-10 w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => handleQuery(e)}
        />
        <SearchIcon className="absolute left-2" />
        <div className="flex absolute text-gray-400 right-1 gap-4">
          <div className="">
            <span className="bg-gray-50 p-1 border border-mainBorder rounded-lg">
              Ctrl
            </span>
            <span className=" p-1 ">+</span>
            <span className="bg-gray-50 p-1 border border-mainBorder rounded-lg">
              K
            </span>
          </div>
        </div>
      </div>
      {data?.length > 0 && query && (
        <div
          ref={modalRef}
          className="absolute w-full h-[400px] z-50 top-14 p-2 bg-white rounded-lg  pr-4"
        >
          <Table data={data} columns={columns} />
        </div>
      )}
    </div>
  );
};
