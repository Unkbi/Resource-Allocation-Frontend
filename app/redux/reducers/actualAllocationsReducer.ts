import { ActualAllocationsState } from '@/app/types';
import {
  generateTMinusOneStartEndDate,
  getMonday,
  getMondayOfISO,
  getSundayOfISO,
} from '@/app/utils/common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: ActualAllocationsState = {
  actualAllocations: [],
  status: null,
  dataProcessing: false,
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
    // updateAllAllocations: (state, action: PayloadAction<AllAllocations[]>) => {
    //   const updatedRows = action.payload ?? [];
    //   const updatedMap = new Map(updatedRows.map((row: any) => [row.id, row]));

    //   const existingAllocations = state.allAllocations ?? [];

    //   const updatedAllocations = existingAllocations.map(existing => {
    //     if (updatedMap.has(existing.id)) {
    //       return updatedMap.get(existing.id);
    //     }
    //     return existing;
    //   });

    //   // Add any new rows that didn’t exist before
    //   for (const row of updatedRows) {
    //     if (
    //       !updatedAllocations?.find(r => (r as AllAllocations).id === row.id)
    //     ) {
    //       updatedAllocations?.push(row);
    //     }
    //   }
    //   state.allAllocations = updatedAllocations;
    // },
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
  setDataProcessing,
  setCalendarDate,
  //   updateAllAllocations,
} = actualAllocationsSlice.actions;

// Export the reducer
export default actualAllocationsSlice.reducer;
