import { createSlice } from "@reduxjs/toolkit";
import { getCookie, setCookie, deleteCookie, saveRole, getRole } from "./tokenService";

export const authService = createSlice({
  name: "authService",
  initialState: {
    token: getCookie("token") || null,
    role: getRole() || null,
    refreshToken: getCookie("refreshToken") || null,
    isAuthenticated: !!getCookie("token"),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, refreshToken, role } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.role = role;
      saveRole(role);
      setCookie("token", token, 1);
      setCookie("refreshToken", refreshToken, 7);
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      deleteCookie("token");
      deleteCookie("refreshToken");
    },
  },
});

export const { setCredentials, logout } = authService.actions;

export default authService.reducer;
