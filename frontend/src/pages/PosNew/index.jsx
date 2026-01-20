import React, { useEffect, useRef, useState } from "react";
import { Plus } from "../../assets/Plus";
import { Logout } from "../../assets/Logout";
import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../../components/Table";
import TrashBin from "../../assets/TrashBin";
import { Cash } from "../../assets/Cash";
import { CreditCard } from "../../assets/CreditCard";
import Payment from "../../assets/Payment";
import {
  useGetProductsByQueryQuery,
  useLazyGetProductByIdQuery,
  usePostSaleMutation,
  usePostSalePreviewMutation,
} from "../../redux/slices/ApiSlice";
import { BarcodeField } from "../../components/BarcodeField";
import { ProductShortcuts } from "../../components/Pos/ProductShortcuts";
import { NavLink } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { QtyInput } from "../../components/QtyInput";
import { useTranslation } from "react-i18next";
import { SearchModal } from "../../components/Pos/SearchModal";
import { ChartPie } from "../../assets/chart-pie";
import Return from "../../assets/Navigation/Return";
import { PaymentStage } from "../../components/Pos/PaymentStage";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  changeQty,
  closeCart,
  createCart,
  removeProduct,
  switchCart,
} from "../../redux/products/products.slice";
import {
  selectActiveProducts,
  selectOpenCarts,
} from "../../redux/products/products.hook";
import { CloseIcon } from "../../assets/Close";
export const PosNew = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeCartId } = useSelector((s) => s.products);
  const products = useSelector(selectActiveProducts) || [];
  const carts = useSelector((s) => selectOpenCarts(s)) || [];
  const columnHelper = createColumnHelper();
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [postPreview, { isLoading: previewLoading }] =
    usePostSalePreviewMutation();
  const { data: searchData } = useGetProductsByQueryQuery(query, {
    skip: !query || query.length < 3,
  });
  const [trigger, { isLoading, isFetching }] = useLazyGetProductByIdQuery();
  const columns = [
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start rounded-s-lg bg-gray-100",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("price"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => <span>{row.original?.sellPrice?.toFixed(2)} ₼</span>,
    }),
    columnHelper.accessor("quantity", {
      header: t("quantity"),
      cell: ({ row }) => (
        <QtyInput
          qty={row.original.quantity}
          barcode={row.original.barcode}
          handleQty={handleChangeQtyAndFocus}
          allign={"justify-center"}
        />
      ),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal", {
      header: t("subtotal"),
      headerClassName: "text-center  bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div>
          <span>{row.original?.subtotal?.toFixed(2)} ₼</span>
        </div>
      ),
    }),
    columnHelper.accessor("action", {
      header: t("delete"),
      headerClassName: "text-center rounded-e-lg bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <button
          onClick={() =>
            dispatch(
              removeProduct({
                cartId: activeCartId,
                barcode: row.original.barcode,
              }),
            )
          }
        >
          <TrashBin className="size-6 text-red-500" />
        </button>
      ),
    }),
  ];
  const [paymentStage, setPaymentStage] = useState(false);
  const [type, setType] = useState("sale");
  const [discount, setDiscount] = useState(0);
  const [postSale, { isLoading: postLoading }] = usePostSaleMutation();
  const searchInput = useRef();
  const modalRef = useRef();
  const barcodeRef = useRef();

  useEffect(() => {
    if (carts.length === 0) {
      dispatch(createCart());
    }
  }, []);
  useEffect(() => {
    document.title = "Kassa";
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && key === "k") {
        e.preventDefault();
        searchInput.current?.focus();
      } else if (key === "/") {
        e.preventDefault();
      } else if (key === "escape") {
        setQuery("");
        barcodeRef.current?.focus();
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
  }, []);

  const handleChangeQty = async (barcode, action, qty) => {
    const existProduct = products.find((x) => x.barcode == barcode);

    if (existProduct) {
      // Adet bazlı ürünler için eski davranış
      dispatch(
        changeQty({
          cartId: activeCartId,
          product_id: existProduct.product_id,
          barcode: existProduct.barcode,
          qty: qty,
          operation: action,
        }),
      );
      return;
    }

    // Ürün yoksa ve artırma işlemi ise yeni ürün ekle
    if (action === "increase") {
      if (isFetching) return;
      try {
        const validProduct = await trigger(barcode).unwrap();
        if (!validProduct) return null;

        const existProduct = products.find(
          (x) => x.barcode == validProduct.productBarcode,
        );

        if (existProduct) {
          // Ürün zaten listede varsa, miktarı artır
          dispatch(
            changeQty({
              cartId: activeCartId,
              product_id: validProduct.product_id,
              quantity: 1,
              barcode: validProduct.barcode,
            }),
          );

          return;
        } else
          dispatch(
            addProduct({
              cartId: activeCartId,
              product: {
                product_id: validProduct.product_id,
                quantity: validProduct.quantity ? validProduct.quantity : 1,
                barcode: validProduct.barcode,
                unit: validProduct.unit,
              },
            }),
          );
      } catch (err) {
        toast.error(err?.data?.error);
        console.log(err);
      }
    }

    barcodeRef.current?.focus();
  };

  const handleSubmitSale = async (type, payments) => {
    if (postLoading) return;
    try {
      await postSale({
        products: data?.items,
        type: type || "sale",
        discount: discount,
        payments: payments,
      }).unwrap();
      setData([]);
      setPaymentStage(false);
      dispatch(closeCart(activeCartId));
      setDiscount(0);
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    } catch (error) {
      console.log(error);
    }
  };
  const handleChangeDiscount = (value) => {
    setDiscount(value);
  };

  useEffect(() => {
    const handlePreview = async () => {
      if (products.length == 0) {
        setData([]);
        return;
      }
      const response = await postPreview({
        items: products,
        discount: discount,
      }).unwrap();
      setData(response); // response = { subtotal, total, items }
    };

    handlePreview();
  }, [products, discount]);

  const handleChangeQtyAndFocus = (...args) => {
    handleChangeQty(...args);
    barcodeRef.current?.focus();
  };

  const stageType = (type) => {
    setType(type);
    setPaymentStage(true);
  };

  return (
    <div className="flex flex-col  overflow-hidden h-screen  gap-2 w-full ">
      <ToastContainer />

      <div className="flex gap-4 items-center justify-between px-8 py-4">
        <div className="flex gap-2 ">
          {carts.map((cart, index) => (
            <div
              className={`px-3 rounded-lg flex items-center gap-2 py-3 pr-4 border border-mainBorder     ${
                cart.isActive ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              key={cart.cartId}
            >
              <button
                className="text-nowrap"
                onClick={() => dispatch(switchCart(cart.cartId))}
              >
                Səbət {index + 1}
              </button>
              <span
                onClick={() => dispatch(closeCart(cart.cartId))}
                className="cursor-pointer"
              >
                <CloseIcon className={"size-5"} />
              </span>
            </div>
          ))}
          {carts.length < 3 && (
            <div>
              <button
                className="flex gap-2 h-full border border-mainBorder  rounded-lg items-center py-2 p-4   "
                onClick={(e) => {
                  e.stopPropagation();

                  dispatch(createCart());
                }}
              >
                <Plus className={"size-5"} />{" "}
                <span className="">Yeni Səbət</span>
              </button>
            </div>
          )}
        </div>
        <SearchModal
          data={searchData}
          setQuery={setQuery}
          query={query}
          barcodeRef={barcodeRef}
          handleAdd={handleChangeQtyAndFocus}
        />
        <div className="flex items-center gap-6">
          <NavLink to={"/"}>
            <Logout className="size-8 text-gray-500" />
          </NavLink>
          <BarcodeField
            ref={barcodeRef}
            handleBarcode={(id) => handleChangeQty(id, "increase")}
          />
        </div>
      </div>
      <div className="bg-[#F8F8F8] w-full flex h-full px-4  min-h-0">
        <ProductShortcuts
          data={data?.items}
          // products={products}
          handleChangeQty={handleChangeQtyAndFocus}
        />
        <div className="flex-1 min-h-0  bg-white px-4 gap-4 h-full flex flex-col justify-between pb-2 ">
          {paymentStage && products.length > 0 ? (
            <PaymentStage
              type={type}
              handleBack={() => setPaymentStage(false)}
              value={data?.total}
              data={data}
              setDiscount={handleChangeDiscount}
              discount={discount}
              submitSale={handleSubmitSale}
            />
          ) : (
            <div className="flex-1  px-4 gap-4  flex flex-col bg-white rounded-2xl  justify-between py-4 h-full  ">
              <Table columns={columns} data={data?.items} pagination={false} />
              {products.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-end">
                    {/* <span className="text-2xl font-medium">{t("Total")}</span> */}
                    <span className="text-3xl font-medium">
                      {data?.total?.toFixed(2) || "0.00"} ₼
                    </span>
                  </div>

                  <div className="flex flex-row-reverse items-center gap-2 w-full h-full">
                    <button
                      disabled={data.length == 0 || postLoading}
                      onClick={() => stageType("sale")}
                      className="flex justify-center bg-[#00a63e] cursor-pointer text-xl gap-2 items-center text-white px-6 h-16 rounded-lg w-full"
                    >
                      <Payment className={"size-8 "} />
                      <span className=""> {t("Ödənişə keç")}</span>
                    </button>
                    <button
                      disabled={data.length == 0 || postLoading}
                      onClick={() => stageType("return")}
                      className="flex justify-center bg-red-500 cursor-pointer text-xl gap-2 items-center text-white px-6 h-16 rounded-lg w-full"
                    >
                      <Payment className={"size-8 "} />
                      <span className=""> {t("return")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
