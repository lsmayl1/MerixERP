import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeCartId: null,
  carts: [],
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    createCart: (state, action) => {
      const cartId = action.payload;
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
      const { cartId, product_id, quantity } = action.payload;
      const cart = state.carts[cartId];
      if (!cart) return;

      const product = cart.products.find((p) => p.product_id === product_id);
      console.log("CartId:", cartId);
      console.log("Cart:", cart);
      console.log("Cart productId:", product_id);

      if (product) {
        product.quantity = quantity;
      }
    },

    removeItem: (state, action) => {
      const { cartId, productId } = action.payload;
      state.carts[cartId].items = state.carts[cartId].products.filter(
        (i) => i.productId !== productId
      );
    },

    closeCart: (state, action) => {
      delete state.carts[action.payload];
      if (state.activeCartId === action.payload) {
        state.activeCartId = null;
      }
    },
  },
});

export const { createCart, addProduct, changeQty } = productsSlice.actions;

export default productsSlice.reducer;
