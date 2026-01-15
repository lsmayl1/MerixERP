import { createSelector } from "@reduxjs/toolkit";

export const selectActiveCartId = (state) => state.products.activeCartId;
export const selectCarts = (state) => state.products.carts;

export const selectActiveProducts = createSelector(
  [selectActiveCartId, selectCarts],
  (activeCartId, carts) => {
    if (!activeCartId) return [];

    const cart = carts[activeCartId]; // 🔥 əsas düzəliş buradır
    return cart ? cart.products : [];
  }
);

export const selectOpenCarts = createSelector(
  [selectCarts, selectActiveCartId],
  (carts, activeCartId) => {
    return Object.values(carts).map((cart) => ({
      ...cart,
      isActive: cart.cartId === activeCartId,
    }));
  }
);
