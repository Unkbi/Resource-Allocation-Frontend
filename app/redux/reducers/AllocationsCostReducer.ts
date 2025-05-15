// src/reducers/projectCostSlice.ts
import { AllAllocations, AllocationsCostState } from '@/app/types';
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
    updateAllocationsCosts: (
      state,
      action: PayloadAction<AllAllocations[]>
    ) => {
      state.costs = action.payload;
    },
    resetAllocationsCosts: state => {
      state.costs = [];
    },
  },
});

export const {
  setCost,
  setDataProcessing,
  updateAllocationsCosts,
  resetAllocationsCosts,
} = allocationsCostSlice.actions;

export default allocationsCostSlice.reducer;
