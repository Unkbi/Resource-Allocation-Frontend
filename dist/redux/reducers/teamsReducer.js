"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAllTeamsResources = exports.updateStartAndEndDate = exports.setTeamsDataProcessing = exports.resetResources = exports.updateResources = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const teamServices_1 = require("@/app/services/teamServices");
const common_1 = require("@/app/utils/common");
const initialState = {
    teams: null,
    resources: [],
    allAllocations: [],
    teamAllocations: [],
    teamsResources: {},
    loading: false,
    dataProcessing: false,
    error: null,
    calendarDate: {
        startDate: (0, common_1.generateTMinusOneStartEndDate)(true),
        endDate: (0, common_1.generateTMinusOneStartEndDate)(false)
    }
};
const teamsSlice = (0, toolkit_1.createSlice)({
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
            action.payload.forEach(payload => {
                state.teamsResources[payload.id] = payload.resource;
            });
        },
        updateStartAndEndDate: (state, action) => {
            state.calendarDate = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            // Handle getAllTeams API call
            .addCase(teamServices_1.getAllTeams.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(teamServices_1.getAllTeams.fulfilled, (state, action) => {
            state.loading = false;
            state.teams = action.payload;
        })
            .addCase(teamServices_1.getAllTeams.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // Handle getResourcesAgainstTeams API call
            .addCase(teamServices_1.getResourcesAgainstTeams.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(teamServices_1.getResourcesAgainstTeams.fulfilled, state => {
            state.loading = false;
        })
            .addCase(teamServices_1.getResourcesAgainstTeams.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // Handle getAllAllocationsForPeriod API call
            .addCase(teamServices_1.getAllAllocationsForPeriod.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(teamServices_1.getAllAllocationsForPeriod.fulfilled, (state, action) => {
            state.loading = false;
            state.allAllocations = action.payload;
        })
            .addCase(teamServices_1.getAllAllocationsForPeriod.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // Handle getTeamAllocations API call
            .addCase(teamServices_1.getTeamAllocations.pending, state => {
            state.error = null;
        })
            .addCase(teamServices_1.getTeamAllocations.fulfilled, (state, action) => {
            state.loading = false;
            state.teamAllocations = action.payload;
        })
            .addCase(teamServices_1.getTeamAllocations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // Handle postTeamResource API call
            .addCase(teamServices_1.postTeamResource.pending, state => {
            state.error = null;
        })
            .addCase(teamServices_1.postTeamResource.fulfilled, state => {
            state.loading = false;
        })
            .addCase(teamServices_1.postTeamResource.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
_a = teamsSlice.actions, exports.updateResources = _a.updateResources, exports.resetResources = _a.resetResources, exports.setTeamsDataProcessing = _a.setTeamsDataProcessing, exports.updateStartAndEndDate = _a.updateStartAndEndDate, exports.setAllTeamsResources = _a.setAllTeamsResources;
exports.default = teamsSlice.reducer;
