// src/reducers/projectCostSlice.ts
import { AllocationsCost, AllocationsCostState } from '@/app/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AllocationsCostState = {
  costs: [],
  loading: false,
  error: null,
};

const allocationsCostSlice = createSlice({
  name: 'allocationsCost',
  initialState,
  reducers: {
    setCost: (state, action) => {
      state.costs = action.payload;
    },
    setDataProcessing: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateProjectCosts: (state, action: PayloadAction<AllocationsCost[]>) => {
      state.costs = action.payload;
    },
    resetProjectCosts: state => {
      state.costs = [];
    },
  },
});

export const {
  setCost,
  setDataProcessing,
  updateProjectCosts,
  resetProjectCosts,
} = allocationsCostSlice.actions;

export default allocationsCostSlice.reducer;
