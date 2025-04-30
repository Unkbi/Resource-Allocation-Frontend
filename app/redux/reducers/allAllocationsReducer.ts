import { AllAllocations, AllAllocationsState } from '@/app/types';
import { generateTMinusOneStartEndDate } from '@/app/utils/common';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AllAllocationsState = {
  allAllocations: [],
  dataProcessing: false,
  loading: false,
  calendarDate: {
    startDate: generateTMinusOneStartEndDate(true),
    endDate: generateTMinusOneStartEndDate(false),
  },
};

const allAllocationsSlice = createSlice({
  name: 'allAllocations',
  initialState,
  reducers: {
    setAllAllocations: (state, action) => {
      state.allAllocations = action.payload;
    },
    updateAllAllocations: (state, action: PayloadAction<AllAllocations[]>) => {
      const updatedRows = action.payload ?? [];
      const updatedMap = new Map(updatedRows.map((row: any) => [row.id, row]));

      const existingAllocations = state.allAllocations ?? [];

      const updatedAllocations = existingAllocations.map(existing => {
        if (updatedMap.has(existing.id)) {
          return updatedMap.get(existing.id);
        }
        return existing;
      });

      // Add any new rows that didn’t exist before
      for (const row of updatedRows) {
        if (
          !updatedAllocations?.find(r => (r as AllAllocations).id === row.id)
        ) {
          updatedAllocations?.push(row);
        }
      }
      state.allAllocations = updatedAllocations;
    },
    resetAllocations: state => {
      state.allAllocations = [];
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
  },
  extraReducers: builder => {
    builder;
    // Handle getAllAllocations API call
  },
});

// Export the actions
export const {
  setAllAllocations,
  resetAllocations,
  setDataProcessing,
  updateAllAllocations,
} = allAllocationsSlice.actions;

// Export the reducer
export default allAllocationsSlice.reducer;
