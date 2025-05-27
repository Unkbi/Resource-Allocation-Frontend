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
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setEmployeeRates, clearEmployeeRates, setLoading, setError } =
  employeeRatesSlice.actions;
export default employeeRatesSlice.reducer;
