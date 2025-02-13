import { createSlice } from '@reduxjs/toolkit';
import {
  getAllAllocationsForPeriod,
  getAllTeams,
  getResourcesAgainstTeams,
} from '@/app/services/teamServices';

const initialState = {
  teams: null,
  resources: [],
  allAllocations: [],
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    updateResources: (state, action) => {
      const uniqueResources = action.payload.filter(
        newAlloc =>
          !state.resources.some(
            existingAlloc => existingAlloc.id === newAlloc.id
          )
      );
      state.resources = [...state.resources, ...uniqueResources];
    },
    resetResources: state => {
      state.resources = [];
    },
  },
  extraReducers: builder => {
    builder
      // Handle getAllTeams API call
      .addCase(getAllTeams.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(getAllTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle getResourcesAgainstTeams API call
      .addCase(getResourcesAgainstTeams.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResourcesAgainstTeams.fulfilled, state => {
        state.loading = false;
      })
      .addCase(getResourcesAgainstTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle getAllAllocationsForPeriod API call
      .addCase(getAllAllocationsForPeriod.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAllocationsForPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.allAllocations = action.payload;
      })
      .addCase(getAllAllocationsForPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateResources, resetResources } = teamsSlice.actions;
export default teamsSlice.reducer;
