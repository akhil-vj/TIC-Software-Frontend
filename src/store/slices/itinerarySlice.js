import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: [],
};

const Itinerary = createSlice({
  name: "itinerary",
  initialState,
  reducers: {
    setFormData(state, action) {
      state = action.payload;
    },
  },
});

export const { setFormData } = Itinerary.actions;
export default Itinerary.reducer;
