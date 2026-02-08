import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseQuery";

export const userApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery,
  endpoints: (build) => ({
    getAllUsers: build.query({
      query: () => "/user/",
      keepUnusedDataFor: 0,
    }),
    createUser: build.mutation({
      query: (data) => ({
        url: "user/create",
        body: data,
        method: "POST",
      }),
    }),
    deleteUser: build.mutation({
      query: (id) => ({
        url: `user/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useDeleteUserMutation,
} = userApiSlice;
