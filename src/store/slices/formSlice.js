import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  editId: "",
  name: "",
  refresh: false,
  loading:false
};

const Form = createSlice({
  name: "form",
  initialState,
  reducers: {
    setEditId(state, action) {
      state.editId = action.payload;
    },
    setRefresh(state, action) {
      state.refresh = !state.refresh;
    },
    setName(state, action) {
      state.name = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const FormAction = Form.actions;
export default Form.reducer;
