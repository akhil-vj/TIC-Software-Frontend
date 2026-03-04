import { createSlice } from "@reduxjs/toolkit";

// Get tax values from localStorage if available
const getTaxFromStorage = () => {
  try {
    const stored = localStorage.getItem("taxSettings");
    return stored
      ? JSON.parse(stored)
      : {
          cgst_percentage: 0,
          sgst_percentage: 0,
          igst_percentage: 0,
          tcs_percentage: 0,
          additionalTaxes: [],
        };
  } catch {
    return {
      cgst_percentage: 0,
      sgst_percentage: 0,
      igst_percentage: 0,
      tcs_percentage: 0,
      additionalTaxes: [],
    };
  }
};

const defaultState = getTaxFromStorage();

const initialState = {
  cgst_percentage: defaultState.cgst_percentage,
  sgst_percentage: defaultState.sgst_percentage,
  igst_percentage: defaultState.igst_percentage,
  tcs_percentage: defaultState.tcs_percentage,
  additionalTaxes: defaultState.additionalTaxes || [],
};

const taxSlice = createSlice({
  name: "tax",
  initialState,
  reducers: {
    setTaxValues: (state, action) => {
      const { cgst_percentage, sgst_percentage, igst_percentage, tcs_percentage } = action.payload;
      state.cgst_percentage = cgst_percentage ?? state.cgst_percentage;
      state.sgst_percentage = sgst_percentage ?? state.sgst_percentage;
      state.igst_percentage = igst_percentage ?? state.igst_percentage;
      state.tcs_percentage = tcs_percentage ?? state.tcs_percentage;

      // Save to localStorage
      const dataToSave = {
        cgst_percentage: state.cgst_percentage,
        sgst_percentage: state.sgst_percentage,
        igst_percentage: state.igst_percentage,
        tcs_percentage: state.tcs_percentage,
        additionalTaxes: state.additionalTaxes || [],
      };
      localStorage.setItem("taxSettings", JSON.stringify(dataToSave));
    },
    addAdditionalTax: (state, action) => {
      const { name, percentage } = action.payload;
      const newTax = {
        id: Date.now(),
        name,
        percentage,
        createdAt: new Date().toISOString(),
      };
      state.additionalTaxes = [...(state.additionalTaxes || []), newTax];

      const dataToSave = {
        cgst_percentage: state.cgst_percentage,
        sgst_percentage: state.sgst_percentage,
        igst_percentage: state.igst_percentage,
        tcs_percentage: state.tcs_percentage,
        additionalTaxes: state.additionalTaxes,
      };
      localStorage.setItem("taxSettings", JSON.stringify(dataToSave));
    },
    updateAdditionalTax: (state, action) => {
      const { id, name, percentage } = action.payload;
      const tax = state.additionalTaxes.find((t) => t.id === id);
      if (tax) {
        tax.name = name;
        tax.percentage = percentage;
      }

      const dataToSave = {
        cgst_percentage: state.cgst_percentage,
        sgst_percentage: state.sgst_percentage,
        igst_percentage: state.igst_percentage,
        tcs_percentage: state.tcs_percentage,
        additionalTaxes: state.additionalTaxes,
      };
      localStorage.setItem("taxSettings", JSON.stringify(dataToSave));
    },
    deleteAdditionalTax: (state, action) => {
      const { id } = action.payload;
      state.additionalTaxes = state.additionalTaxes.filter((t) => t.id !== id);

      const dataToSave = {
        cgst_percentage: state.cgst_percentage,
        sgst_percentage: state.sgst_percentage,
        igst_percentage: state.igst_percentage,
        tcs_percentage: state.tcs_percentage,
        additionalTaxes: state.additionalTaxes,
      };
      localStorage.setItem("taxSettings", JSON.stringify(dataToSave));
    },
    resetTaxValues: (state) => {
      state.cgst_percentage = 0;
      state.sgst_percentage = 0;
      state.igst_percentage = 0;
      state.tcs_percentage = 0;
      state.additionalTaxes = [];
      localStorage.removeItem("taxSettings");
    },
  },
});

export const { setTaxValues, addAdditionalTax, updateAdditionalTax, deleteAdditionalTax, resetTaxValues } = taxSlice.actions;
export default taxSlice.reducer;
