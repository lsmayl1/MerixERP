import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveProducts,
  selectOpenCarts,
} from "../redux/products/products.hook";
import { useEffect, useRef, useState } from "react";
import {
  useLazyGetProductByIdQuery,
  usePostSaleMutation,
  usePostSalePreviewMutation,
} from "../redux/slices/ApiSlice";
import {
  addProduct,
  changeQty,
  closeCart,
  createCart,
} from "../redux/products/products.slice";
import { toast } from "react-toastify";

export const usePos = () => {
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

  return {
    carts,
    barcodeRef,
    handleChangeQty,
    handleChangeQtyAndFocus,
    data,
    products,
    discount,
    setDiscount,
    handleSubmitSale,
    stageType,
    modalRef,
    type,
    paymentStage,
    isLoading,
    postLoading,
    setPaymentStage,
    activeCartId,
  };
};
