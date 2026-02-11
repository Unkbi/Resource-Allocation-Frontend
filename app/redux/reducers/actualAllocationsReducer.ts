import { ActualAllocationsState, ActualStatus } from '@/app/types';
import { getMondayOfISO, getSundayOfISO } from '@/app/utils/common';
import { createSlice } from '@reduxjs/toolkit';
// @ts-ignore
import { isMonday, parseISO } from 'date-fns';

const initialState: ActualAllocationsState = {
  actualAllocations: {},
  actualAllocationsStatuses: {},
  actualsStatus: [],
  status: null,
  dataProcessing: true,
  actualAllocationsStatusesLoading: false,
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
      const allocs = formatedResponse?.Allocs || [];
      const grouped = allocs.reduce((acc: Record<string, any[]>, item: any) => {
        const allocation = item?.Allocation ?? item;
        const period = allocation?.Period;
        if (!period) return acc;
        if (!acc[period]) acc[period] = [];
        acc[period].push(allocation);
        return acc;
      }, {});
      state.actualAllocations = grouped;
      state.status = formatedResponse?.Status;
    },
    setActualAllocationsStatuses: (state, action) => {
      const statuses = action.payload || [];
      const groupedStatuses = (statuses || []).reduce(
        (acc: Record<string, string>, item: any) => {
          const period = item?.Period;
          const status = item?.Status ?? null;
          if (!period) return acc;
          acc[period] = status;
          return acc;
        },
        {}
      );
      state.actualAllocationsStatuses = groupedStatuses;
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
    updateActualAllocationsStatusForPeriod: (state, action) => {
      const { period, status } = action.payload;
      if (!period) return;

      if (state.actualAllocationsStatuses) {
        state.actualAllocationsStatuses[period] = status;
      }
    },

    resetActualAllocations: state => {
      state.actualAllocations = {};
      state.actualAllocationsStatuses = {};
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
    setActualAllocationsStatusesLoading: (state, action) => {
      state.actualAllocationsStatusesLoading = action.payload;
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
  setActualAllocationsStatuses,
  setActualAllocationsStatus,
  setActualsStatus,
  updateActualAllocationsStatusForPeriod,
  setDataProcessing,
  setActualAllocationsStatusesLoading,
  setActualsStatusLoading,
  setCalendarDate,
} = actualAllocationsSlice.actions;

// Export the reducer
export default actualAllocationsSlice.reducer;
