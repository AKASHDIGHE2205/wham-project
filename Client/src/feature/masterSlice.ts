import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Master {
  mem_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  user_id: number;
  user_name: string;
  step_id: number;
  step_name: string;
  university_id: number;
  university_name: string;
  clg_id: number;
  clg_name: string;
  dept_id: number;
  dept_name: string;
}

const initialState: Master = {
  mem_id: 0,
  first_name: "",
  middle_name: "",
  last_name: "",
  user_id: 0,
  user_name: "",
  step_id: 0,
  step_name: "",
  university_id: 0,
  university_name: "",
  clg_id: 0,
  clg_name: "",
  dept_id: 0,
  dept_name: "",
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
      }>,
    ) => {
      const { id, first_name, middle_name, last_name } = action.payload;
      state.mem_id = id;
      state.first_name = first_name;
      state.middle_name = middle_name;
      state.last_name = last_name;
    },
    handleSelectUser: (
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) => {
      const { id, name } = action.payload;
      state.user_id = id;
      state.user_name = name;
    },
    handleSelectStep: (
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) => {
      const { id, name } = action.payload;
      state.step_id = id;
      state.step_name = name;
    },
    handleSelectUniversity: (
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) => {
      const { id, name } = action.payload;
      state.university_id = id;
      state.university_name = name;
    },
    handleSelectCollege: (
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) => {
      const { id, name } = action.payload;
      state.clg_id = id;
      state.clg_name = name;
    },
    handleSelectDepartment: (
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) => {
      const { id, name } = action.payload;
      state.dept_id = id;
      state.dept_name = name;
    },
  },
});
export const {
  handleSelectMember,
  handleSelectUser,
  handleSelectStep,
  handleSelectUniversity,
  handleSelectCollege,
  handleSelectDepartment,
} = masterSlice.actions;
export default masterSlice.reducer;
