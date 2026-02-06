import React, { useState } from "react";
import { useGetProductsByQueryQuery } from "../../redux/slices/ApiSlice";
import TrashBin from "../../assets/Buttons/TrashBin";
import { QtyInput } from "../QtyInput";
import { useTranslation } from "react-i18next";
import {
  useCreateProductShortcutMutation,
  useDeleteProductShortcutMutation,
  useGetAllProductShortcutsQuery,
} from "../../redux/slices/productsShortcuts/ProductShortcutsSlice";
import { SearchModal } from "./SearchModal";

export const ProductShortcuts = ({
  handleChangeQty,
  data: existProduct,
  barcodeRef,
  modalRef,
}) => {
  const { t } = useTranslation();
  const { data, refetch } = useGetAllProductShortcutsQuery();
  const [createShortCut] = useCreateProductShortcutMutation();
  const [deleteShortCut] = useDeleteProductShortcutMutation();
  const [openContext, setOpenContext] = useState(null);
  const [query, setQuery] = useState("");
  const { data: searchData } = useGetProductsByQueryQuery(query, {
    skip: !query || query.length < 3,
  });

  const handleCreateShortcut = async (product_id, position) => {
    try {
      await createShortCut({ product_id, position }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to create shortcut:", error);
    }
  };

  const handleDeleteShortcut = async (product_id, e) => {
    try {
      e.stopPropagation();
      await deleteShortCut(product_id).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete shortcut:", error);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto relative gap-2 flex flex-col">
      <SearchModal
        query={query}
        setQuery={setQuery}
        data={searchData}
        barcodeRef={barcodeRef}
        modalRef={modalRef}
        handleAdd={handleChangeQty}
        handleShortCut={handleCreateShortcut}
      />

      <ul className="grid grid-cols-3 gap-2  pr-2 overflow-auto min-h-0 py-2 ">
        {data?.map((item, index) => (
          <li
            key={index}
            onClick={(e) => (
              e.stopPropagation(),
              handleChangeQty(item.product.barcode, "increase")
            )}
            onContextMenu={(e) => {
              e.preventDefault();
              if (openContext == item.product.product_id) {
                setOpenContext(null);
              } else {
                setOpenContext(item.product.product_id);
              }
            }}
            className={`flex cursor-pointer gap-4   flex-col relative px-4 py-2 rounded-lg justify-between   border border-mainBorder ${
              existProduct?.find((x) => x.barcode == item.product.barcode)
                ? "bg-blue-600  text-white"
                : "bg-white"
            }`}
          >
            <span className="bg-red-500  p-1 rounded-lg absolute right-0 top-[-4px] text-center text-xs text-white">
              {item?.product?.stock?.current_stock}
            </span>
            <h1 className="text-flg font-medium w-9/12">{item.product.name}</h1>
            <div className="flex justify-between w-full">
              <h1 className="text-lg text-nowrap ">{item.product.sellPrice} ₼</h1>

              <QtyInput
                barcode={item.product.barcode}
                qty={
                  existProduct?.find((x) => x.barcode == item.product.barcode)
                    ?.quantity
                }
                handleQty={handleChangeQty}
                allign={"justify-end"}
                className={
                  existProduct?.find((x) => x.barcode == item.product.barcode)
                    ? "bg-blue-600 text-white "
                    : "bg-white"
                }
              />
            </div>

            {openContext === item.product.product_id && (
              <button
                onClick={(e) =>
                  handleDeleteShortcut(item.product.product_id, e)
                }
                className="absolute w-full  rounded-lg h-full flex items-center justify-center right-0 top-0  bg-blur-xs bg-white gap-2"
              >
                <TrashBin className="size-8" />
                <span className="text-xl text-black">{t("delete")}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
