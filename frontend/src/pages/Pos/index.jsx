import React, { useEffect, useRef, useState } from "react";
import { Plus } from "../../assets/Plus";
import { Table } from "../../components/Table";
import Payment from "../../assets/Payment";
import {
  useLazyGetProductByIdQuery,
  usePostSaleMutation,
  usePostSalePreviewMutation,
} from "../../redux/slices/ApiSlice";
import { BarcodeField } from "../../components/BarcodeField";
import { ProductShortcuts } from "../../components/Pos/ProductShortcuts";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
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
import { PosColumn } from "../../components/Pos/Pos.column";
export const Pos = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeCartId } = useSelector((s) => s.products);
  const products = useSelector(selectActiveProducts) || [];
  const carts = useSelector((s) => selectOpenCarts(s)) || [];
  const [data, setData] = useState([]);
  const [postPreview, { isLoading: previewLoading }] =
    usePostSalePreviewMutation();
  const [trigger, { isLoading, isFetching }] = useLazyGetProductByIdQuery();
  const [paymentStage, setPaymentStage] = useState(false);
  const [type, setType] = useState("sale");
  const [discount, setDiscount] = useState(0);
  const [postSale, { isLoading: postLoading }] = usePostSaleMutation();
  const modalRef = useRef();
  const barcodeRef = useRef();

  useEffect(() => {
    if (carts.length === 0) {
      dispatch(createCart());
    }
  }, [carts.length, dispatch]);

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

  useEffect(() => {
    const handlePreview = async () => {
      if (products.length == 0) {
        setData([]);
        return;
      }
      if (previewLoading) return;
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

      <div className="flex bg-white rounded-lg p-2 gap-4 items-center justify-between  ">
        <div className="flex gap-2 ">
          {carts.map((cart, index) => (
            <div
              className={`px-3 text-xs rounded-lg flex items-center gap-2 py-3 pr-4 border border-mainBorder     ${
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
                <CloseIcon className={"size-4"} />
              </span>
            </div>
          ))}
          {carts.length < 3 && (
            <div>
              <button
                className="flex gap-2 h-full text-md border border-mainBorder  rounded-lg items-center p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(createCart());
                }}
              >
                <Plus className={"size-4"} />{" "}
                <span className="">Yeni Səbət</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <BarcodeField
            ref={barcodeRef}
            handleBarcode={(id) => handleChangeQty(id, "increase")}
          />
        </div>
      </div>
      <div className="bg-[#F8F8F8] w-full flex h-full gap-4   min-h-0">
        <ProductShortcuts
          data={data?.items}
          handleChangeQty={handleChangeQtyAndFocus}
          barcodeRef={barcodeRef}
          modalRef={modalRef}
        />
        <div className="flex-1 min-h-0 rounded-lg  bg-white p-2 gap-4 h-full flex flex-col justify-between pb-2 ">
          {paymentStage && products.length > 0 ? (
            <PaymentStage
              type={type}
              handleBack={() => setPaymentStage(false)}
              value={data?.total}
              data={data}
              setDiscount={(value) => setDiscount(value)}
              discount={discount}
              submitSale={handleSubmitSale}
            />
          ) : (
            <div className="flex-1   gap-4  flex flex-col bg-white rounded-2xl  justify-between h-full  ">
              <Table
                columns={PosColumn({
                  t,
                  handleChangeQty: handleChangeQtyAndFocus,
                  removeProduct: (barcode) =>
                    dispatch(
                      removeProduct({
                        cartId: activeCartId,
                        barcode: barcode,
                      }),
                    ),
                })}
                data={data?.items}
                pagination={false}
                isLoading={isLoading}
              />
              {products.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-end">
                    {/* <span className="text-2xl font-medium">{t("Total")}</span> */}
                    <span className="text-3xl font-medium">
                      {data?.total?.toFixed(2) || "0.00"} ₼
                    </span>
                  </div>

                  <div className="flex flex-row-reverse items-center gap-4 w-full h-full">
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
