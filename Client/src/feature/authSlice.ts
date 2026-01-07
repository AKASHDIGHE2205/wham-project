import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import { secretKey } from "../constant/Baseurl";
import Cookies from "js-cookie";

// ✅ Helper to decrypt safely
const decryptUser = (encrypted: string | undefined) => {
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

// ✅ Read from cookies
const encryptedUser = Cookies.get("user");
const token = Cookies.get("token");

const initialState = {
  isAuthenticated: !!token,
  user: decryptUser(encryptedUser),
  token: token || null,
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

      const encryptedData1 = CryptoJS.AES.encrypt(
        JSON.stringify(data?.user || data),
        secretKey
      ).toString();

      // ✅ Store in cookies instead of localStorage
      Cookies.set("token", data?.token, {
        expires: 7, // days
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
      Cookies.remove("token");
      Cookies.remove("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
