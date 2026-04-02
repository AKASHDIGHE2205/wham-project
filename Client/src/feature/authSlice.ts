import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { secretKey } from "../constant/Baseurl";
import { verifyTokenApi } from "../services/auth/authApi";

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isAuthLoading: true,
};

export const verifyAndLoadUser = async () => {
  const token = Cookies.get("token");

  if (!token) return initialState;

  const userFromBackend = await verifyTokenApi(token);

  if (!userFromBackend) {
    Cookies.remove("token");
    Cookies.remove("user");
    return initialState;
  }

  return {
    isAuthenticated: true,
    user: userFromBackend,
    token,
  };
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { data } = action.payload;

      state.isAuthenticated = !!data?.token;
      state.user = data?.user || data;
      state.token = data?.token;
      state.isAuthLoading = false;

      const encryptedData1 = CryptoJS.AES.encrypt(
        JSON.stringify(data?.user || data),
        secretKey,
      ).toString();

      Cookies.set("token", data?.token, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });
      Cookies.set("user", encryptedData1, {
        expires: 7,
        secure: true,
        sameSite: "strict",
      });
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.isAuthLoading = false;
      Cookies.remove("token");
      Cookies.remove("user");
    },
    setUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthLoading = false;
    },
    authFinished: (state) => {
      state.isAuthLoading = false;
    },
  },
});

export const { login, logout, setUser, authFinished } = authSlice.actions;
export default authSlice.reducer;