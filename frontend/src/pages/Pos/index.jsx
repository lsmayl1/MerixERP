import React from "react";
import { Plus } from "../../assets/Buttons/Plus";
import { Table } from "../../components/Table";
import Payment from "../../assets/Buttons/Payment";
import { BarcodeField } from "../../components/BarcodeField";
import { ProductShortcuts } from "../../components/Pos/ProductShortcuts";
import { ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { PaymentStage } from "../../components/Pos/PaymentStage";
import { useDispatch } from "react-redux";
import {
  closeCart,
  createCart,
  removeProduct,
  switchCart,
} from "../../redux/products/products.slice";
import { CloseIcon } from "../../assets/Buttons/Close";
import { PosColumn } from "../../components/Pos/Pos.column";
import { usePos } from "../../hooks/usePos";
export const Pos = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    handleSubmitSale,
    carts,
    barcodeRef,
    data,
    handleChangeQtyAndFocus,
    handleChangeQty,
    modalRef,
    paymentStage,
    isLoading,
    products,
    postLoading,
    stageType,
    type,
    discount,
    setDiscount,
    setPaymentStage,
    activeCartId,
  } = usePos();

  return (
    <div className="flex flex-col  overflow-hidden gap-2 h-screen w-full ">
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
        <div></div>

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
      <ToastContainer />
    </div>
  );
};
