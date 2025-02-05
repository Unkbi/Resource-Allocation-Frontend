import { createSlice } from '@reduxjs/toolkit';
import {
  getAllProjects,
  getProjectAllocations,
} from '@/app/services/projectServices';

const initialState = {
  projects: null,
  allocations: [],
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    updateAllocations: (state, action) => {
      state.allocations = [...state.allocations, ...action.payload];
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
        state.projects = action.payload;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.error = action.payload;
      });
  },
});

export const { updateAllocations } = projectsSlice.actions;
export default projectsSlice.reducer;
