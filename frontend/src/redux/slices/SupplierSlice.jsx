import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "../baseQuery";

export const SupplierSlice = createApi({
  reducerPath: "supplier",
  baseQuery,
  endpoints: (build) => ({
    getSuppliers: build.query({
      query: () => `/suppliers/`,
    }),
    createSupplier: build.mutation({
      query: (newSupplier) => ({
        url: `/suppliers/`,
        method: "POST",
        body: newSupplier,
      }),
    }),
    deleteSupplier: build.mutation({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
    }),
    getSupplierById: build.query({
      query: (id) => `/suppliers/${id}`,
      keepUnusedDataFor: 0,
    }),
    getSupplierByQuery: build.query({
      query: (query) => ({
        url: `/suppliers/query?query=${query}`,
      }),
      keepUnusedDataFor: 0,
    }),
    getSupplierTransactionsById: build.query({
      query: (supplierId) => `/supplier-transactions/${supplierId}`,
      keepUnusedDataFor: 0,
      providesTags: (result, error, id) => [
        { type: "SupplierTransactions", id },
      ],
    }),
    createSupplierTransaction: build.mutation({
      query: (transaction) => ({
        url: `/supplier-transactions/`,
        method: "POST",
        body: transaction,
      }),
    }),
    getTotalPaymentsMetric: build.query({
      query: () => "/metrics/payments-total",
    }),
    deleteSupplierTransaction: build.mutation({
      query: (id) => ({
        url: `/supplier-transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SupplierTransactions"],
    }),
    createSupplierInvoice: build.mutation({
      query: (data) => ({
        url: `supplier-transactions/v2/`,
        method: "POST",
        body: data,
      }),
    }),
    getSupplierInvoice: build.mutation({
      query: ({ supplier_id, transaction_id }) => ({
        url: `/supplier-transactions/v2/${supplier_id}/${transaction_id}`,
        method: "POST",
        body: { supplier_id, transaction_id },
      }),

      keepUnusedDataFor: 0, // Disable caching for this query
    }),
    updateSupplierInvoice: build.mutation({
      query: ({ transaction_id, data }) => ({
        url: `/supplier-transactions/v2/${transaction_id}`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSupplierByIdQuery,
  useGetSupplierTransactionsByIdQuery,
  useCreateSupplierTransactionMutation,

  useGetTotalPaymentsMetricQuery,

  useCreateSupplierInvoiceMutation,
  useDeleteSupplierTransactionMutation,

  useGetSupplierInvoiceMutation,
  useGetSupplierByQueryQuery,

  useUpdateSupplierInvoiceMutation,
} = SupplierSlice;
