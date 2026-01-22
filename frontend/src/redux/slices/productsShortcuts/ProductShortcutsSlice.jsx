import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseQuery";

export const ProductShortcutsApiSlice = createApi({
  reducerPath: "productShortcutsApi",
  baseQuery,
  endpoints: (build) => ({
    getAllProductShortcuts: build.query({
      query: () => ({
        url: "/product-shortcuts",
        method: "GET",
      }),
    }),
    createProductShortcut: build.mutation({
      query: (newShortcut) => ({
        url: "/product-shortcuts",
        method: "POST",
        body: newShortcut,
      }),
    }),
    deleteProductShortcut: build.mutation({
      query: (id) => ({
        url: `/product-shortcuts/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllProductShortcutsQuery,
  useCreateProductShortcutMutation,
  useDeleteProductShortcutMutation,
} = ProductShortcutsApiSlice;
