import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Master {
  mem_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  user_id: number;
  user_name: string;
}

const initialState: Master = {
  mem_id: 0,
  first_name: "",
  middle_name: "",
  last_name: "",
  user_id: 0,
  user_name: "",
};

export const masterSlice = createSlice({
  name: "masterSlice",
  initialState,
  reducers: {
    handleSelectMember: (
      state,
      action: PayloadAction<{
        id: number;
        first_name: string;
        middle_name: string;
        last_name: string;
      }>
    ) => {
      const { id, first_name, middle_name, last_name } = action.payload;
      state.mem_id = id;
      state.first_name = first_name;
      state.middle_name = middle_name;
      state.last_name = last_name;
    },
    handleSelectUser: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      const { id, name } = action.payload;
      state.user_id = id;
      state.user_name = name;
    },
  },
});
export const { handleSelectMember, handleSelectUser } = masterSlice.actions;
export default masterSlice.reducer;
