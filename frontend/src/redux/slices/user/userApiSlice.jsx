import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseQuery";

export const userApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery,
  endpoints: (build) => ({
    getAllUsers: build.query({
      query: () => "/user/",
    }),
    createUser: build.mutation({
      query: (data) => ({
        url: "user/create",
        body: data,
        method: "POST",
      }),
    }),
  }),
});

export const { useCreateUserMutation, useGetAllUsersQuery } = userApiSlice;
