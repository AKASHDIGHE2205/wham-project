import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";

const secretKey = `Malpani@2025`;

// ✅ Helper to decrypt safely
const decryptUser = (encrypted: string | null) => {
  if (!encrypted) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

const storedEncryptedUser = localStorage.getItem("user");

const initialState = {
  isAuthenticated: !!localStorage.getItem("token"),
  user: decryptUser(storedEncryptedUser),
  token: localStorage.getItem("token"),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { data } = action.payload;
      state.isAuthenticated = !!data.token;
      state.user = data.user || data;
      state.token = data.token;

      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(data.user || data),
        secretKey
      ).toString();

      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", encryptedData);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;

      // ✅ Remove from LocalStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
