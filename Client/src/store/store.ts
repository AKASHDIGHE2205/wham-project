import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../feature/authSlice";
import masterSlice from "../feature/masterSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    master: masterSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
