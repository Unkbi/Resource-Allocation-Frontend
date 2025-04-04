import { createSlice } from '@reduxjs/toolkit';
import {
  getAllAllocationsForPeriod,
  getAllTeams,
  getResourcesAgainstTeams,
  getTeamAllocations,
  /*
   * Not being used currently in application
   * Uncomment the following code if you want to handle postTeamResource API call
   */
  // postTeamResource,
} from '@/app/services/teamServices';
import { generateTMinusOneStartEndDate } from '@/app/utils/common';
import { Resource, TeamState } from '@/app/types';

const initialState: TeamState = {
  teams: null,
  resources: [],
  allAllocations: {},
  teamAllocations: {},
  teamsResources: {},
  loading: false,
  dataProcessing: false,
  error: null,
  calendarDate: {
    startDate: generateTMinusOneStartEndDate(true),
    endDate: generateTMinusOneStartEndDate(false),
  },
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    updateResources: (state, action) => {
      state.resources = action.payload;
    },
    resetResources: state => {
      state.resources = [];
    },
    setTeamsDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
    setAllTeamsResources: (state, action) => {
      action.payload.forEach(
        (payload: { id: string; resource: Resource[] }) => {
          state.teamsResources = state.teamsResources || {};
          state.teamsResources[payload.id] = payload.resource;
        }
      );
    },
    updateStartAndEndDate: (state, action) => {
      state.calendarDate = action.payload;
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
        state.error = action.payload as string | null;
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
        state.error = action.payload as string | null;
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
        state.error = action.payload as string | null;
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
        state.error = action.payload as string | null;
      });
    /*
     * Not being used currently in application
     * Uncomment the following code if you want to handle postTeamResource API call
     */
    // Handle postTeamResource API call
    // .addCase(postTeamResource.pending, state => {
    //   state.error = null;
    // })
    // .addCase(postTeamResource.fulfilled, state => {
    //   state.loading = false;
    // })
    // .addCase(postTeamResource.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
  },
});

export const {
  updateResources,
  resetResources,
  setTeamsDataProcessing,
  updateStartAndEndDate,
  setAllTeamsResources,
} = teamsSlice.actions;
export default teamsSlice.reducer;
