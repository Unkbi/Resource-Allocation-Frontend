import { createSlice } from '@reduxjs/toolkit';
import {
  getAllProjects,
  getProjectAllocations,
  addProject,
  updateProject,
  deleteProject,
} from '@/app/services/projectServices';
import { generateTMinusOneStartEndDate } from '@/app/utils/common';
import { ProjectState } from '@/app/types';
import { formatAPIResponse } from '@/app/utils/authUtils';

const initialState: ProjectState = {
  projects: null,
  allocations: [],
  loading: false,
  dataProcessing: false,
  error: null,
  updating: false,
  calendarDate: {
    startDate: generateTMinusOneStartEndDate(true),
    endDate: generateTMinusOneStartEndDate(false),
  },
};

const projectsSlice = createSlice({
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
      .addCase(getAllProjects.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = formatAPIResponse(
                  'Project',
                  action.payload as string | null
                );
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      //Handle addProject API call
      .addCase(addProject.pending, state => {
        state.loading = true;
        state.updating = true;
        state.error = null;
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.loading = false;
        state.updating = false;
        //   state.projects = {
        //     ...state.projects,
        //     results: [...state.projects.results, action.payload],
        // }
      })
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.updating = false;
        state.error = action.payload as string;
      })
      //Handle updateProject API call
      .addCase(updateProject.pending, state => {
        state.loading = true;
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.updating = false;
        state.projects = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.updating = false;
        state.error = action.payload as string;
      })
      //Handle deleteProject API call
      .addCase(deleteProject.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle getProjectAllocations API call
      .addCase(getProjectAllocations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectAllocations.fulfilled, state => {
        state.loading = false;
      })
      .addCase(getProjectAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  updateAllocations,
  resetAllocations,
  setDataProcessing,
  updateProjectStartAndEndDate,
} = projectsSlice.actions;
export default projectsSlice.reducer;
