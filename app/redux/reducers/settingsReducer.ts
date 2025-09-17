// settingsReducer.ts
import {
  addAllocationTheme,
  getAllocationTheme,
  updateAllocationThemes,
} from '@/app/services/settingServices';
import { AllocationRange, ParentEntry } from '@/app/types';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  allocationTheme: AllocationRange[];
  loading: boolean;
  error: string | null;
  updating: boolean;
}

const initialState: ThemeState = {
  allocationTheme: [
    {
      id: '1',
      __id__: '',
      From: '0.0',
      To: '0.0',
      Label: 'No Allocation',
      Color: '#847ODE',
      DarkColor: '#8470DE',
    },
  ],
  loading: false,
  error: null,
  updating: false,
};

const settings = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateAllocationTheme: (
      state,
      action: PayloadAction<AllocationRange[]>
    ) => {
      state.allocationTheme = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Handle getAllocationTheme
      .addCase(getAllocationTheme.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllocationTheme.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(action.payload)) {
          console.error('Unexpected data structure:', action.payload);
          return;
        }
        const formattedResponse = formatAPIResponse(
          'AllocationRangeSetting',
          action.payload
        );
        const result: ParentEntry[] = formattedResponse;
        state.allocationTheme = result.flatMap((parentEntry: ParentEntry) =>
          parentEntry.AllocationRanges?.map(apiRange => ({
            id: apiRange.Id,
            __id__: parentEntry.Id, // Allocation Range id is maintianed internally as __id__ and APIs as Id.
            Label: apiRange.Label,
            From: apiRange.From,
            To: apiRange.To,
            Color: apiRange.Color,
            DarkColor: apiRange.DarkColor,
          }))
        );
      })
      .addCase(getAllocationTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle addAllocationTheme
      .addCase(addAllocationTheme.pending, state => {
        state.loading = true;
        state.updating = true;
        state.error = null;
      })
      .addCase(addAllocationTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.updating = false;
        const newParentEntry = action.payload.AllocationRangeSetting;
        if (state.allocationTheme) {
          // We modify the __id__ of all the ranges to the newly created ParentEntry Id
          state.allocationTheme = state.allocationTheme.map(range => ({
            ...range,
            __id__: newParentEntry.Id, // Allocation Range id is maintianed internally as __id__ and APIs as Id.
          }));
        }
      })
      .addCase(addAllocationTheme.rejected, (state, action) => {
        state.loading = false;
        state.updating = false;
        state.error = action.payload as string;
      })

      // Handle updateAllocationTheme
      .addCase(updateAllocationThemes.pending, state => {
        state.loading = true;
        state.updating = true;
        state.error = null;
      })
      .addCase(updateAllocationThemes.fulfilled, (state, action) => {
        state.loading = false;
        state.updating = false;
        const updatedParentEntry = formatAPIResponse(
          'AllocationRangeSetting',
          action.payload
        )[0];
        const updatedRange = updatedParentEntry.AllocationRanges[0];

        if (state.allocationTheme) {
          const index = state.allocationTheme.findIndex(
            range =>
              range.id === updatedRange.Id &&
              range.__id__ === updatedParentEntry.Id // Allocation Range id is maintianed internally as __id__ and APIs as Id.
          );
          if (index !== -1) {
            state.allocationTheme[index] = {
              id: updatedRange.Id,
              __id__: updatedParentEntry.Id, // Allocation Range id is maintianed internally as __id__ and APIs as Id.
              Label: updatedRange.Label,
              From: updatedRange.From,
              To: updatedRange.To,
              Color: updatedRange.Color,
              DarkColor: updatedRange.DarkColor,
            };
          }
        }
      })

      .addCase(updateAllocationThemes.rejected, (state, action) => {
        state.loading = false;
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateAllocationTheme } = settings.actions;
export default settings.reducer;
