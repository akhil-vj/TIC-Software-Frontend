import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  enquiryList: [],
  enquiryById: {},
};

const Fetch = createSlice({
  name: "fetchData",
  initialState,
  reducers: {
    setEnquiryList(state, action) {
      state.enquiryList = action.payload;
    },
    setEnquiryById(state, action) {
      state.enquiryById = action.payload;
    },
  },
});

export const FetchAction = Fetch.actions;
export default Fetch.reducer;
