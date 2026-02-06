import React, { useEffect, useState } from "react";
import CloseSquare from "../../assets/Navigation/CloseSquare";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useGetProductsByQueryQuery } from "../../redux/slices/ApiSlice";
import TrashBin from "../../assets/Buttons/TrashBin";

export const StockMovementModal = ({ handleClose, onSubmit }) => {
  const { t } = useTranslation();
  const [transactionType, setTransactionType] = useState("in");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [query, setQuery] = useState("");
  const { data } = useGetProductsByQueryQuery(query, {
    skip: !query,
  });
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      unit_price: selectedProduct?.buyPrice || 0,
      quantity: null,
      description: "",
      product_id: null,
    },
  });
  useEffect(() => {
    if (selectedProduct) {
      setValue("unit_price", selectedProduct.buyPrice);
    }
  }, [selectedProduct]);
  const handleTransactionTypeChange = (method) => {
    setTransactionType(method);
  };

  const validateSubmit = (data) => {
    if (!selectedProduct?.product_id) {
      setError("product_id", { type: "manual", message: "Ürün seçilmelidir" });
      return;
    }
    onSubmit({
      ...data,
      transaction_type: transactionType,
      product_id: selectedProduct.product_id,
    });
  };
  return (
    <div className="absolute right-0 top-0 w-full h-full flex items-center justify-center ">
      <div className="flex overflow-auto flex-col gap-10 bg-white  w-1/2 border border-mainBorder  rounded-lg items-center px-2 py-12">
        <div className="w-full flex justify-end px-12">
          <button onClick={handleClose}>
            <CloseSquare className={"size-10"} />
          </button>
        </div>
        <div className="flex  w-1/2 gap-2   rounded-lg">
          <button
            onClick={() => handleTransactionTypeChange("in")}
            className={`${
              transactionType === "in"
                ? "bg-green-500 text-white"
                : "border border-mainBorder"
            }  py-2 px-4 rounded-lg w-full`}
          >
            Giris
          </button>
          <button
            onClick={() => handleTransactionTypeChange("out")}
            className={` ${
              transactionType === "out"
                ? "bg-red-500 text-white"
                : "border border-mainBorder"
            }
				border border-mainBorder py-2 px-4 w-full rounded-lg`}
          >
            Cixis
          </button>
        </div>
        <form
          className="w-1/2 flex flex-col gap-8"
          onSubmit={handleSubmit(validateSubmit)}
        >
          <div className="relative">
            {selectedProduct === null ? (
              <div className="relative">
                <div className="flex flex-col gap-1 ">
                  <label>Mehsul</label>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    className="border p-2 border-mainBorder rounded-lg"
                  />
                  {errors?.product_id?.message && (
                    <p className="text-red-500">{errors.product_id.message}</p>
                  )}
                </div>
                {data?.length > 0 && query && (
                  <div className="bg-white absolute w-full min-h-24 border border-mainBorder rounded-lg">
                    <ul className="flex flex-col gap-2 overflow-auto max-h-36">
                      {data?.map((data) => (
                        <li
                          key={data.product_id}
                          onClick={() => setSelectedProduct(data)}
                          className="cursor-pointer p-2 hover:bg-gray-300"
                        >
                          {data.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full justify-between flex border border-mainBorder items-center p-2 rounded-lg">
                <h1>{selectedProduct.name}</h1>
                <button onClick={() => setSelectedProduct(null)} type="button">
                  <TrashBin className="size-8" />
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 ">
            <label>Qiymet</label>
            <input
              step={0.0001}
              type="number"
              {...register("unit_price", {
                required: "Unit Price is required",
              })}
              className="border p-2 border-mainBorder rounded-lg"
            />
            {errors?.unit_price?.message && (
              <p className="text-red-500">{errors.unit_price.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1 ">
            <label>Miqdar</label>
            <input
              step={0.0001}
              type="number"
              {...register("quantity", {
                required: "Quantity is required",
              })}
              className="border p-2 border-mainBorder rounded-lg"
            />
            {errors?.quantity?.message && (
              <p className="text-red-500">{errors.quantity.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1 ">
            <label>Tesvir</label>
            <input
              type="text"
              {...register("description", {
                required: "Description is required",
              })}
              className="border p-2 border-mainBorder rounded-lg"
            />
            {errors?.quantity?.message && (
              <p className="text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          <div className="flex items-center gap-4  ">
            <button
              onClick={handleClose}
              type="button"
              className="rounded-xl truncate  w-full max-lg:text-md cursor-pointer border border-red-700 px-4 py-1 font-semibold text-red-700"
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              className="rounded-xl cursor-pointer w-full max-lg:text-md border border-blue-700 px-4 py-1 font-semibold text-blue-700"
            >
              {t("create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
