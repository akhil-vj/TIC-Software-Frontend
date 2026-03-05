// userPermissionsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userPermissionsSlice = createSlice({
  name: "userPermission",
  initialState: [],
  reducers: {
    setUserPermission: (state, action) => {
      return action.payload;
    },
  },
});

export const { setUserPermission } = userPermissionsSlice.actions;
export default userPermissionsSlice.reducer;
