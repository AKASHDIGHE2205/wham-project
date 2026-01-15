// import { createSlice } from "@reduxjs/toolkit";
// import CryptoJS from "crypto-js";
// import { secretKey } from "../constant/Baseurl";
// import Cookies from "js-cookie";

// // ✅ Helper to decrypt safely
// const decryptUser = (encrypted: string | undefined) => {
//   if (!encrypted) return null;
//   try {
//     const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
//     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//   } catch {
//     return null;
//   }
// };

// // ✅ Read from cookies
// const encryptedUser = Cookies.get("user");
// const token = Cookies.get("token");

// const initialState = {
//   isAuthenticated: !!token,
//   user: decryptUser(encryptedUser),
//   token: token || null,
// };

// export const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     login: (state, action) => {
//       const { data } = action.payload;

//       state.isAuthenticated = !!data?.token;
//       state.user = data?.user || data;
//       state.token = data?.token;

//       const encryptedData1 = CryptoJS.AES.encrypt(
//         JSON.stringify(data?.user || data),
//         secretKey
//       ).toString();

//       // ✅ Store in cookies instead of localStorage
//       Cookies.set("token", data?.token, {
//         expires: 7, // days
//         secure: true,
//         sameSite: "strict",
//       });

//       Cookies.set("user", encryptedData1, {
//         expires: 7,
//         secure: true,
//         sameSite: "strict",
//       });
//     },
//     logout: (state) => {
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       Cookies.remove("token");
//       Cookies.remove("user");
//     },
//   },
// });

// export const { login, logout } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import { secretKey } from "../constant/Baseurl";
import Cookies from "js-cookie";
import { verifyTokenApi } from "../services/auth/authApi";

const token = Cookies.get("token");

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isAuthLoading: true,
};

export const verifyAndLoadUser = async () => {
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
        secretKey
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
