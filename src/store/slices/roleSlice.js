import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
};

const Role = createSlice({
  name: "role",
  initialState,
  reducers: {
    setName(state, action) {
      state.name = action.payload;
    },
  },
});

export const RoleAction = Role.actions;
export default Role.reducer;
