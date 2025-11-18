import { ActualAllocationsState, ActualStatus } from '@/app/types';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { getMondayOfISO, getSundayOfISO } from '@/app/utils/common';
import { createSlice } from '@reduxjs/toolkit';
// @ts-ignore
import { isMonday, parseISO } from 'date-fns';

const initialState: ActualAllocationsState = {
  actualAllocations: [],
  actualsStatus: [],
  status: null,
  dataProcessing: true,
  actualsStatusLoading: true,
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
      const formatedResponse = action.payload?.GetActualizedAllocsOut;
      state.actualAllocations = formatAPIResponse(
        'Allocation',
        formatedResponse?.Allocs
      );
      state.status = formatedResponse?.Status;
    },
    setActualAllocationsStatus: (state, action) => {
      state.status = action.payload;
    },
    setActualsStatus: (state, action) => {
      state.actualsStatus = action.payload
        ? action.payload
            .filter((status: ActualStatus) => {
              const date = parseISO(status.Period);
              return isMonday(date); // Check if the date is a Monday
            })
            .sort((a: ActualStatus, b: ActualStatus) => {
              return (
                new Date(a.Period).getTime() - new Date(b.Period).getTime()
              );
            })
        : [];
    },
    resetActualAllocations: state => {
      state.actualAllocations = [];
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
    setActualsStatusLoading: (state, action) => {
      state.actualsStatusLoading = action.payload;
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
  setActualsStatus,
  setDataProcessing,
  setActualsStatusLoading,
  setCalendarDate,
} = actualAllocationsSlice.actions;

// Export the reducer
export default actualAllocationsSlice.reducer;
