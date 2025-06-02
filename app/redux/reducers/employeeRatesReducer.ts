import { EmployeeRatesState } from '@/app/types/employeeRatesTypes';
import { createSlice } from '@reduxjs/toolkit';

const initialState: EmployeeRatesState = {
  employeeRates: [],
  loading: false,
  error: null,
};

const employeeRatesSlice = createSlice({
  name: 'employeeRates',
  initialState,
  reducers: {
    setEmployeeRates: (state, action) => {
      state.employeeRates = action.payload;
    },
    clearEmployeeRates: state => {
      state.employeeRates = [];
    },
    updateEmployeeRate: (state, action) => {
      const updatedRate = action.payload;
      if (!state.employeeRates) return; 
      const index = state.employeeRates.findIndex(
        rate => rate.__Id__ === updatedRate.__Id__
      );
      if (index !== -1) {
        state.employeeRates[index] = {
          ...state.employeeRates[index],
          ...updatedRate,
        };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setEmployeeRates,
  clearEmployeeRates,
  setLoading,
  setError,
  updateEmployeeRate,
} = employeeRatesSlice.actions;
export default employeeRatesSlice.reducer;
