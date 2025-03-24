import { createSlice } from '@reduxjs/toolkit';
import {
  getAllAllocationsForPeriod,
  getAllTeams,
  getResourcesAgainstTeams,
  getTeamAllocations,
  postTeamResource,
} from '@/app/services/teamServices';

const initialState = {
  teams: null,
  resources: [],
  allAllocations: [],
  teamAllocations: [],
  teamsResources: {},
  loading: false,
  dataProcessing: false,
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
    setTeamsDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
    setTeamsResources: (state, action) => {
      state.teamsResources[action.payload.id] = action.payload.resource;
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
      })
      // Handle getTeamAllocations API call
      .addCase(getTeamAllocations.pending, state => {
        state.error = null;
      })
      .addCase(getTeamAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.teamAllocations = action.payload;
      })
      .addCase(getTeamAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle postTeamResource API call
      .addCase(postTeamResource.pending, state => {
        state.error = null;
      })
      .addCase(postTeamResource.fulfilled, state => {
        state.loading = false;
      })
      .addCase(postTeamResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateResources, resetResources, setTeamsDataProcessing, setTeamsResources } =
  teamsSlice.actions;
export default teamsSlice.reducer;
