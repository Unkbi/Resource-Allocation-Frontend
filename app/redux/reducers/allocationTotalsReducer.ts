import { AllocationTotalsState } from "@/app/types/allocationTotalsTypes";
import { formatAPIResponse } from "@/app/utils/authUtils";
import { createSlice } from "@reduxjs/toolkit";


const initialState: AllocationTotalsState = {
  totalAllocations: [],
  totalAllocationCosts: [],
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
  GrandTotalActualsCost: 0,
  GrandTotalPlannedCost: 0,
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
      const data = action.payload;
      state.totalAllocationCosts = data?.Projects || [];
      state.GrandTotalPlannedCost =
        data?.GrandTotalPlannedCost ?? 0;
      state.GrandTotalActualsCost =
        data?.GrandTotalActualsCost ?? 0;
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
      state.totalAllocationCosts = [];
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