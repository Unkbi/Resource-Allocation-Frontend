import { AllocationTotalsState } from "@/app/types/allocationTotalsTypes";
import { formatAPIResponse } from "@/app/utils/authUtils";
import { createSlice } from "@reduxjs/toolkit";


const initialState: AllocationTotalsState = {
  totalAllocations: [],
 totalAllocationCosts: null,
  totalAllocationSummary: null,
  totalAllocationsTillDate: [],
  totalAllocationCostsTillDate: null,
  totalAllocationSummaryTillDate: null,
  dataProcessing: true,
  loading: false,
  error: null,
  totalAllocationsGrandTotal: 0,
  totalActualsGrandTotal: 0,
  totalAllocationsTillDateGrandTotal: 0,
  totalActualsTillDateGrandTotal: 0,
};

const allocationTotalsSlice = createSlice({
  name: 'allocationTotals',
  initialState,
  reducers: {
  setTotalAllocations: (state, action) => {
      const data = action.payload;
      state.totalAllocations = data?.Projects || [];
      state.totalAllocationsGrandTotal =
        data?.GrandTotalAllocationsEntered ?? 0;
      state.totalActualsGrandTotal =
        data?.GrandTotalActualsEntered ?? 0;
    },
    setTotalAllocationCosts: (state, action) => {
      state.totalAllocationCosts = formatAPIResponse("AllocationCosts", action.payload);
    },
    setTotalAllocationSummary: (state, action) => {
      state.totalAllocationSummary = formatAPIResponse("AllocationSummary", action.payload);
    },
    setTotalAllocationsTillDate: (state, action) => {
       const data = action.payload;
      state.totalAllocationsTillDate = data?.Projects || [];
      state.totalAllocationsTillDateGrandTotal =
        data?.GrandTotalAllocationsEntered ?? 0;
      state.totalActualsTillDateGrandTotal =
        data?.GrandTotalActualsEntered ?? 0;
    },
    setTotalAllocationCostsTillDate: (state, action) => {
      state.totalAllocationCostsTillDate = formatAPIResponse("AllocationCostsTillDate", action.payload);
    },
    setTotalAllocationSummaryTillDate: (state, action) => {
      state.totalAllocationSummaryTillDate = formatAPIResponse("AllocationSummaryTillDate", action.payload);
    },
    clearAllocationTotals: (state) => {
      state.totalAllocations = [];
      state.totalAllocationCosts = null;
      state.totalAllocationSummary = null;
      state.totalAllocationsTillDate = [];
      state.totalAllocationCostsTillDate = null;
      state.totalAllocationSummaryTillDate = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
  },
});

export const {
  setTotalAllocations,
  setTotalAllocationCosts,
  setTotalAllocationSummary,
  setTotalAllocationsTillDate,
  setTotalAllocationCostsTillDate,
  setTotalAllocationSummaryTillDate,
  clearAllocationTotals,
  setLoading,
  setError,
  setDataProcessing,
} = allocationTotalsSlice.actions;

export default allocationTotalsSlice.reducer;