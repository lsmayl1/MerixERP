import React, { useEffect, useState } from "react";
import { Minus } from "../../assets/Minus";
import { Plus } from "../../assets/Plus";
import {
  useGetBulkProductMutation,
  useGetProductsByQueryQuery,
} from "../../redux/slices/ApiSlice";
import { SearchIcon } from "../../assets/SearchIcon";
import { Xcircle } from "../../assets/Xcircle";
import { Table } from "../Table";
import { createColumnHelper } from "@tanstack/react-table";
import TrashBin from "../../assets/TrashBin";
import { QtyInput } from "../QtyInput";
import { useTranslation } from "react-i18next";

export const ProductShortcuts = ({
  products = [],
  data = [],
  handleChangeQty,
}) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper();
  const [showAddModal, setShowAddModal] = useState(false);
  const [openContext, setOpenContext] = useState(null);
  const colums = [
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start rounded-s-lg bg-gray-100",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("price"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("action", {
      header: t("add"),
      headerClassName: "text-center rounded-e-lg bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <button
          onClick={() => handleIdentifiers(row.original.barcode)}
          className=" p-1  bg-white border border-mainBorder rounded-lg"
        >
          <Plus className="size-6" />
        </button>
      ),
    }),
  ];
  const [getShortCuts, { isLoading }] = useGetBulkProductMutation();
  const [query, setQuery] = useState("");
  const { data: searchData } = useGetProductsByQueryQuery(query, {
    skip: !query || query.length < 3,
  });
  const [identifiers, setIdentifiers] = useState(() => {
    try {
      const raw = localStorage.getItem("identifiers");
      const data = raw && raw !== "undefined" ? JSON.parse(raw) : [];
      return data || [];
    } catch (err) {
      console.error("Invalid JSON in localStorage:", err);
      return [];
    }
  });
  const [shortCuts, setShortCuts] = useState([]);

  useEffect(() => {
    const handleData = async () => {
      if (identifiers && identifiers.length > 0) {
        try {
          const shortcuts = await getShortCuts({
            identifiers: identifiers,
          }).unwrap();
          setShortCuts(shortcuts);
        } catch (error) {
          console.log(error);
        }
      }
    };
    handleData();
  }, [getShortCuts, identifiers]);

  const deleteIdentifiers = async (id, e) => {
    e.stopPropagation();
    const updatedIds = (identifiers || []).filter((x) => x != id);

    // If there are no identifiers left, fully clear storage and shortcuts
    if (!updatedIds || updatedIds.length === 0) {
      setIdentifiers([]);
      localStorage.removeItem("identifiers");
      setShortCuts([]);
      return;
    }

    setIdentifiers(updatedIds);
    localStorage.setItem("identifiers", JSON.stringify(updatedIds));
    try {
      const data = await getShortCuts({ identifiers: updatedIds }).unwrap();
      setShortCuts(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleIdentifiers = async (id) => {
    const updatedIds = [...new Set([...(identifiers || []), id])]; // tekrarları önler
    setIdentifiers(updatedIds);
    localStorage.setItem("identifiers", JSON.stringify(updatedIds || []));

    try {
      const data = await getShortCuts({ identifiers: updatedIds }).unwrap();
      setShortCuts(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto relative">
      {showAddModal && (
        <div className="w-full h-full absolute z-50  flex items-center justify-center ">
          <div className="bg-white flex flex-col ounded-lg p-5 gap-2 w-9/12 h-2/3 min-h-0 shadow-2xl border border-mainBorder rounded-lg">
            <h1 className="text-xl font-semibold ">{t("addProduct")}</h1>
            <div className="flex items-center  relative w-full">
              <input
                type="text"
                placeholder={t("Searchbynameorbarcode")}
                className="border border-mainBorder rounded-lg py-2 px-10 w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                // onKeyDown={(e) => {
                //   if (e.key === "Enter") {
                //     setQuery(e.target.value);
                //   }
                // }}
              />
              <SearchIcon className="absolute left-2" />
              <button
                onClick={() => {
                  setQuery("");
                  setShowAddModal(false);
                }}
                className="absolute right-2"
              >
                <Xcircle />
              </button>
            </div>
            <div className="overflow-auto ">
              <Table
                columns={colums}
                data={searchData || shortCuts}
                pagination={false}
              />
            </div>
          </div>
        </div>
      )}

      <ul className="grid grid-cols-3 gap-2 p-4 overflow-auto min-h-0">
        {shortCuts?.map((item, index) => (
          <li
            key={index}
            onClick={(e) => (
              e.stopPropagation(),
              handleChangeQty(item.barcode, "increase")
            )}
            onContextMenu={(e) => {
              e.preventDefault();
              if (openContext == item.barcode) {
                setOpenContext(null);
              } else {
                setOpenContext(item.barcode);
              }
            }}
            className={`flex cursor-pointer  flex-col relative px-4 py-2 rounded-lg justify-between   border border-mainBorder ${
              data?.find((x) => x.barcode == item.barcode)
                ? "bg-blue-600  text-white"
                : "bg-white"
            }`}
          >
            <h1 className="text-lg font-medium">{item.name}</h1>
            <h1 className="text-md ">{item.sellPrice?.toFixed(2)} ₼</h1>
            <div className="flex justify-end items-end w-full">
              <QtyInput
                barcode={item.barcode}
                qty={data?.find((x) => x.barcode == item.barcode)?.quantity}
                handleQty={handleChangeQty}
                allign={"justify-end"}
                className={
                  data?.find((x) => x.barcode == item.barcode)
                    ? "bg-blue-600 text-white "
                    : "bg-white"
                }
              />
            </div>

            {openContext === item.barcode && (
              <button
                onClick={(e) => deleteIdentifiers(item.barcode, e)}
                className="absolute w-full border border-mainBorder  h-full flex items-center justify-center right-0 top-0  bg-blur-xs bg-white gap-2"
              >
                <TrashBin className="size-8" />
                <span className="text-xl text-black">{t("delete")}</span>
              </button>
            )}
          </li>
        ))}
        <li className=" px-6 py-8 border-dashed flex items-center justify-center  rounded-lg  border border-mainBorder bg-white">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 "
          >
            <Plus />
            {t("addProduct")}
          </button>
        </li>
      </ul>
    </div>
  );
};
