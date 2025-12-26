import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TrashBin from "../../assets/TrashBin";
import { BarcodeField } from "../BarcodeField";
import {
  useGetBarcodeMutation,
  useGetProductsByQueryQuery,
  useLazyGetProductByIdQuery,
} from "../../redux/slices/ApiSlice";
import { SearchModal } from "../Pos/SearchModal";
import { Plus } from "../../assets/Plus";

export const SupplierInvoiceModal = ({ handleClose, onSubmit }) => {
  const { t } = useTranslation();
  const [generateBarcode] = useGetBarcodeMutation();
  const [transactionType, setTransactionType] = useState("purchase");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [date, setDate] = useState(null);
  const [columns, setColumns] = useState([
    { label: t("product"), key: "name" },
    { label: t("barcode"), key: "barcode" },
    { label: t("unit"), key: "unit" },
    { label: t("buyPrice"), key: "buyPrice" },
    { label: t("quantity"), key: "quantity" },
    { label: t("sellPrice"), key: "sellPrice" },
    { label: t("amount"), key: "amount" },
    { label: t("delete"), key: "delete" },
  ]);
  const [query, setQuery] = useState("");
  const { data } = useGetProductsByQueryQuery(query, {
    skip: !query,
  });
  const [productList, setProductList] = useState([]);
  const [trigger] = useLazyGetProductByIdQuery();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "0",
      description: "",
    },
  });
  const handleTransactionTypeChange = (method) => {
    setTransactionType(method);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  //   const validateSubmit = (data) => {
  //     onSubmit({
  //       ...data,
  //       type: transactionType,
  //       payment_method: paymentMethod,
  //       date,
  //     });
  //   };

  const handleSubmitInvoice = () => {
    onSubmit({
      products: productList,
      transaction_type: transactionType,
      payment_method: paymentMethod,
      date,
    });
  };

  const handleBarcode = async (barcode) => {
    if (!barcode) {
      return;
    }
    const exist = productList.find(
      (x) => String(x.barcode) === String(barcode)
    );

    if (exist) {
      return;
    }
    try {
      const product = await trigger(barcode).unwrap();
      setProductList([
        ...productList,
        {
          name: product.name,
          barcode: product.barcode,
          buyPrice: product.buyPrice,
          sellPrice: product.sellPrice,
          quantity: 1,
        },
      ]);
      console.log(product);
    } catch (error) {
      console.log(error);
    }
  };

  const updateProduct = (index, key, value) => {
    const updated = [...productList];

    if (
      key === "buyPrice" ||
      key === "quantity" ||
      key === "amount" ||
      key === "sellPrice"
    ) {
      updated[index][key] = value === "" ? "" : parseFloat(value) || 0;
    } else {
      updated[index][key] = value;
    }

    // amount hesapla:
    updated[index].amount = Number(
      ((updated[index].buyPrice || 0) * (updated[index].quantity || 0)).toFixed(
        4
      )
    );

    setProductList(updated);
  };

  const AddProductFromSearch = async (barcode) => {
    console.log(barcode);

    // Önce mevcut listeyi kontrol et
    if (!barcode) {
      return;
    }
    const exist = productList.find(
      (x) => String(x.barcode) === String(barcode)
    );

    if (exist) {
      console.log("Product exists already");
      console.log(exist);

      return;
    }

    try {
      const newProduct = await trigger(barcode).unwrap();
      if (newProduct) {
        setProductList((prev) => [
          ...prev,
          {
            barcode: newProduct.barcode,
            name: newProduct.name,
            unit: newProduct.unit || "piece",
            quantity: 1,
            buyPrice: newProduct.buyPrice || 0,
            sellPrice: newProduct.sellPrice || 0,
            amount: newProduct.buyPrice || 0,
          },
        ]);
      }
    } catch (error) {
      console.log("Ürün getirilirken hata:", error);
    }
  };

  const addProduct = () => {
    setProductList([
      ...productList,
      {
        name: "",
        barcode: "",
        unit: "piece",
        buyPrice: 0,
        quantity: 0,
        sellPrice: 0,
        amount: 0,
      },
    ]);
  };

  const generateNewBarcode = async (unit, index) => {
    try {
      const newBarcode = await generateBarcode({ unit: unit }).unwrap();
      const updated = [...productList];
      updated[index].barcode = newBarcode.barcode;
      setProductList(updated);
      console.log("Yeni barkod oluşturuldu:", newBarcode);
    } catch (error) {
      console.error("Barcode oluşturulurken hata:", error);
    }
  };

  const removeProduct = (index) => {
    const updated = productList.filter((_, i) => i !== index);
    setProductList(updated);
  };
  return (
    <div className="absolute right-0 top-0 w-full flex-col gap-4 h-full flex bg-white border border-mainBorder rounded-lg p-4">
      <div className="w-full flex gap-4 items-center justify-between">
        <div className="flex  gap-4 w-1/6">
          <div className="flex gap-4 items-center">
            <h1>Tarix: </h1>
            <input
              type="date"
              className="border border-mainBorder rounded-lg px-4 py-2 w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              lang="EN-US"
            />
          </div>
          <div className="flex justify-between items-center gap-4">
            <h1 className="w-full text-nowrap">Əməliyyat :</h1>

            <div className="flex items-center">
              <button
                onClick={() => handleTransactionTypeChange("purchase")}
                className={`border bg-white ${
                  transactionType === "purchase"
                    ? "border-green-500 text-green-500"
                    : "border-mainBorder"
                } rounded-l-lg text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center  gap-2 py-1 max-md:py-0`}
              >
                {t("Alim")}
              </button>
              <button
                onClick={() => handleTransactionTypeChange("return")}
                className={`border ${
                  transactionType === "return"
                    ? "border-red-500 text-red-500"
                    : "border-mainBorder"
                }  rounded-e-lg text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0`}
              >
                {t("Qaytarma")}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-nowrap">Odenis Novu :</h1>

            <div className="flex items-center">
              <button
                onClick={() => handlePaymentMethodChange("cash")}
                className={`border bg-white ${
                  paymentMethod === "cash"
                    ? "border-green-500 text-green-500"
                    : "border-mainBorder"
                } rounded-l-lg text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center  gap-2 py-1 max-md:py-0`}
              >
                {t("Nagd")}
              </button>
              <button
                onClick={() => handlePaymentMethodChange("card")}
                className={`border ${
                  paymentMethod === "card"
                    ? "border-red-500 text-red-500"
                    : "border-mainBorder"
                }   text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0`}
              >
                {t("Kart")}
              </button>
              <button
                onClick={() => handlePaymentMethodChange("credit")}
                className={`border ${
                  paymentMethod === "credit"
                    ? "border-red-500 text-red-500"
                    : "border-mainBorder"
                }  rounded-e-lg text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0`}
              >
                {t("Nisiye")}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 h-fit">
          <button
            onClick={handleClose}
            className="border bg-white border-red-500 rounded-xl text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center text-red-500 gap-2 py-1 max-md:py-0"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmitInvoice}
            className="border bg-white border-blue-500 text-blue-500 rounded-xl text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0"
          >
            {t("create")}
          </button>
        </div>
      </div>
      <div className="flex gap-4 flex-col  bg-white  w-full h-full  overflow-auto">
        <div className="flex justify-between items-center">
          <SearchModal
            query={query}
            setQuery={setQuery}
            data={data}
            handleAdd={AddProductFromSearch}
          />
          <BarcodeField handleBarcode={handleBarcode} />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={addProduct}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              + {t("addProduct")}
            </button>
          </div>
        </div>{" "}
        <div className="w-full max-h-full  ">
          {/* Tablo Başlıkları */}
          <div className="grid grid-cols-8 font-bold text-sm   bg-gray-100 ">
            {columns.map((col, idx) => (
              <div key={idx} className="p-2 text-lg font-light">
                {col.label}
              </div>
            ))}
          </div>

          {/* Ürün Satırları */}
          {productList?.map((product, index) => (
            <div key={index} className="grid grid-cols-8 w-full">
              <input
                className="p-2 border border-mainBorder"
                placeholder="Product Name"
                value={product.name}
                onChange={(e) => updateProduct(index, "name", e.target.value)}
              />
              <div className="flex gap-2 items-center h-full w-full  border-mainBorder border pr-2">
                <input
                  className="p-2  w-full h-full"
                  placeholder="Barcode"
                  value={product.barcode}
                  onChange={(e) =>
                    updateProduct(index, "barcode", e.target.value)
                  }
                />
                <button
                  className="p-1 border border-mainBorder text-blue-500 rounded-lg"
                  onClick={() => generateNewBarcode(product.unit, index)}
                >
                  <Plus />
                </button>
              </div>
              <div className="flex gap-2 border border-mainBorder items-center p-1">
                <button
                  onClick={() => updateProduct(index, "unit", "piece")}
                  className={`p-2 border border-mainBorder rounded-lg ${
                    product.unit === "piece" ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  Piece
                </button>
                <button
                  onClick={() => updateProduct(index, "unit", "kg")}
                  className={`p-2 border border-mainBorder rounded-lg ${
                    product.unit === "kg" ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  KG
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                className="p-2 border border-mainBorder"
                placeholder="Alış fiyatı (ör: 12.34)"
                value={
                  product.buyPrice !== undefined && product.buyPrice !== null
                    ? product?.buyPrice
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  updateProduct(
                    index,
                    "buyPrice",
                    value === "" ? "" : parseFloat(value) || 0
                  );
                }}
              />

              <input
                type="number"
                step="0.01"
                className="p-2 border border-mainBorder"
                placeholder="Quantity"
                value={
                  product.quantity !== undefined && product.quantity !== null
                    ? product?.quantity
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  updateProduct(
                    index,
                    "quantity",
                    value === "" ? "" : parseFloat(value) || 0
                  );
                }}
              />
              <input
                type="number"
                step="0.01"
                className="p-2 border border-mainBorder"
                placeholder="Satis qiymeti (ör: 12.34)"
                value={
                  product.sellPrice !== undefined && product.sellPrice !== null
                    ? product?.sellPrice
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  updateProduct(
                    index,
                    "sellPrice",
                    value === "" ? "" : parseFloat(value) || 0
                  );
                }}
              />
              <div className="p-2 border border-mainBorder h-full items-center flex">
                {(product.quantity * product.buyPrice).toFixed(2)}
              </div>
              <button
                className="p-2 border flex items-center border-mainBorder text-red-500"
                onClick={() => removeProduct(index)}
              >
                <TrashBin />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className=" flex gap-2 justify-end items-center text-mainText font-semibold">
        Toplam:{" "}
        <span className="text-black text-xl">
          {productList
            ?.reduce(
              (total, p) => total + (p.buyPrice || 0) * (p.quantity || 0),
              0
            )
            .toFixed(2)}
        </span>
      </div>
    </div>
  );
};
