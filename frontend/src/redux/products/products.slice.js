import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeCartId: null,
  carts: {},
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    createCart: (state) => {
      const cartId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
      state.carts[cartId] = {
        cartId,
        products: [],
      };
      state.activeCartId = cartId;
    },
    switchCart: (state, action) => {
      state.activeCartId = action.payload;
    },
    addProduct: (state, action) => {
      const { cartId, product } = action.payload;
      const cart = state.carts[cartId];
      if (!cart) return;

      const exist = cart.products.find(
        (p) => p.product_id === product.product_id
      );

      if (exist) {
        exist.quantity += product.quantity ?? 1;
      } else {
        cart.products.push({
          ...product,
          quantity: product.quantity ?? 1,
        });
      }
    },

    changeQty: (state, action) => {
      const { cartId, product_id, qty, operation } = action.payload;
      // operation = "increase" | "decrease"

      const cart = state.carts[cartId];
      if (!cart) return;

      const product = cart.products.find((p) => p.product_id === product_id);
      if (!product) return;

      if (qty) {
        product.quantity = Math.max(0.001, Number(qty));
        return;
      }

      let newQuantity = product.quantity;

      if (qty !== undefined && qty !== null) {
        newQuantity = Math.max(0.001, Number(qty)); // direkt qty update
      } else if (operation === "increase") {
        newQuantity += 1; // artır
      } else if (operation === "decrease") {
        newQuantity = Math.max(0.001, newQuantity - 1); // azalt
      }

      product.quantity = newQuantity;
    },

    removeProduct: (state, action) => {
      const { cartId, barcode } = action.payload;
      console.log(cartId, barcode);
      const cart = state.carts[cartId]; // doğru reference
      if (!cart) return;

      cart.products = cart.products.filter((p) => p.barcode !== barcode);
    },

    closeCart: (state, action) => {
      const cartId = action.payload;
      const cartIds = Object.keys(state.carts);

      // 🔒 Əgər tək cart qalıbsa → silmə, boşalt
      if (cartIds.length === 1) {
        const onlyCartId = cartIds[0];
        state.carts[onlyCartId].products = [];
        state.activeCartId = onlyCartId;
        return;
      }

      // 🗑️ Birdən çox cart varsa → sil
      delete state.carts[cartId];

      // Aktiv cart silinibsə → qalanlardan birini aktiv et
      if (state.activeCartId === cartId) {
        const remainingCartIds = Object.keys(state.carts);
        state.activeCartId = remainingCartIds[0];
      }
    },
  },
});

export const {
  createCart,
  addProduct,
  changeQty,
  removeProduct,
  closeCart,
  switchCart,
} = productsSlice.actions;

export default productsSlice.reducer;
