"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectStartAndEndDate = exports.setDataProcessing = exports.resetAllocations = exports.updateAllocations = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const projectServices_1 = require("@/app/services/projectServices");
const common_1 = require("@/app/utils/common");
const initialState = {
    projects: null,
    allocations: [],
    loading: false,
    dataProcessing: false,
    error: null,
    updating: false,
    calendarDate: {
        startDate: (0, common_1.generateTMinusOneStartEndDate)(true),
        endDate: (0, common_1.generateTMinusOneStartEndDate)(false)
    }
};
const projectsSlice = (0, toolkit_1.createSlice)({
    name: 'projects',
    initialState,
    reducers: {
        updateAllocations: (state, action) => {
            // const uniqueAllocations = action.payload.filter(
            //   newAlloc =>
            //     !state.allocations.some(
            //       existingAlloc => existingAlloc.id === newAlloc.id
            //     )
            // );
            state.allocations = [...state.allocations, ...action.payload];
        },
        resetAllocations: state => {
            state.allocations = [];
        },
        setDataProcessing: (state, action) => {
            state.dataProcessing = action.payload;
        },
        updateProjectStartAndEndDate: (state, action) => {
            state.calendarDate = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            //Handle getAllProjects API call
            .addCase(projectServices_1.getAllProjects.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(projectServices_1.getAllProjects.fulfilled, (state, action) => {
            state.loading = false;
            state.projects = action.payload;
        })
            .addCase(projectServices_1.getAllProjects.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            //Handle addProject API call
            .addCase(projectServices_1.addProject.pending, state => {
            state.loading = true;
            state.updating = true;
            state.error = null;
        })
            .addCase(projectServices_1.addProject.fulfilled, (state, action) => {
            state.loading = false;
            state.updating = false;
            //   state.projects = {
            //     ...state.projects,
            //     results: [...state.projects.results, action.payload],
            // }
        })
            .addCase(projectServices_1.addProject.rejected, (state, action) => {
            state.loading = false;
            state.updating = false;
            state.error = action.payload;
        })
            //Handle updateProject API call
            .addCase(projectServices_1.updateProject.pending, state => {
            state.loading = true;
            state.updating = true;
            state.error = null;
        })
            .addCase(projectServices_1.updateProject.fulfilled, (state, action) => {
            state.loading = false;
            state.updating = false;
            state.projects = action.payload;
        })
            .addCase(projectServices_1.updateProject.rejected, (state, action) => {
            state.loading = false;
            state.updating = false;
            state.error = action.payload;
        })
            //Handle deleteProject API call
            .addCase(projectServices_1.deleteProject.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(projectServices_1.deleteProject.fulfilled, (state, action) => {
            state.loading = false;
            state.projects = action.payload;
        })
            .addCase(projectServices_1.deleteProject.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // Handle getProjectAllocations API call
            .addCase(projectServices_1.getProjectAllocations.pending, state => {
            state.loading = true;
            state.error = null;
        })
            .addCase(projectServices_1.getProjectAllocations.fulfilled, state => {
            state.loading = false;
        })
            .addCase(projectServices_1.getProjectAllocations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
_a = projectsSlice.actions, exports.updateAllocations = _a.updateAllocations, exports.resetAllocations = _a.resetAllocations, exports.setDataProcessing = _a.setDataProcessing, exports.updateProjectStartAndEndDate = _a.updateProjectStartAndEndDate;
exports.default = projectsSlice.reducer;
