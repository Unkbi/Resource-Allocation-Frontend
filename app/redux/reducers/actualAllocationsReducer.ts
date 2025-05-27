import { ActualAllocationsState } from '@/app/types';
import { getMondayOfISO, getSundayOfISO } from '@/app/utils/common';
import { createSlice } from '@reduxjs/toolkit';

const initialState: ActualAllocationsState = {
  actualAllocations: [],
  status: null,
  dataProcessing: true,
  loading: false,
  calendarDate: {
    startDate: getMondayOfISO(new Date().toISOString()),
    endDate: getSundayOfISO(new Date().toISOString()),
  },
};

const actualAllocationsSlice = createSlice({
  name: 'actualAllocations',
  initialState,
  reducers: {
    setActualAllocations: (state, action) => {
      state.actualAllocations = action.payload.Allocs;
      state.status = action.payload.Status;
    },
    setActualAllocationsStatus: (state, action) => {
      state.status = action.payload;
    },
    resetActualAllocations: state => {
      state.actualAllocations = [];
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
    setCalendarDate: (state, action) => {
      state.calendarDate = action.payload;
    },
  },
  extraReducers: builder => {
    builder;
    // Handle getAllAllocations API call
  },
});

// Export the actions
export const {
  setActualAllocations,
  resetActualAllocations,
  setActualAllocationsStatus,
  setDataProcessing,
  setCalendarDate,
} = actualAllocationsSlice.actions;

// Export the reducer
export default actualAllocationsSlice.reducer;
