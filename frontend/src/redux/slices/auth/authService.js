import { createSlice } from "@reduxjs/toolkit";
import {
  deleteCookie,
  saveRole,
  getRole,
  saveLocalToken,
  getToken,
  deleteLocalToken,
} from "./tokenService";

export const authService = createSlice({
  name: "authService",
  initialState: {
    token: getToken() || null,
    role: getRole() || null,
    // refreshToken: getToken() || null,
    isAuthenticated: !!getToken(),
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, refreshToken, role } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.role = role;
      saveRole(role);
      saveLocalToken(token);
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      deleteLocalToken();
    },
  },
});

export const { setCredentials, logout } = authService.actions;

export default authService.reducer;
