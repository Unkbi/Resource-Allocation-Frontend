import { createSlice } from '@reduxjs/toolkit';
import {
  getAllProjects,
  getProjectAllocations,
} from '@/app/services/projectServices';

const initialState = {
  projects: null,
  allocations: [],
  loading: false,
  dataProcessing: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    updateAllocations: (state, action) => {
      const uniqueAllocations = action.payload.filter(
        newAlloc =>
          !state.allocations.some(
            existingAlloc => existingAlloc.id === newAlloc.id
          )
      );
      state.allocations = [...state.allocations, ...uniqueAllocations];
    },
    resetAllocations: state => {
      state.allocations = [];
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
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

export const { updateAllocations, resetAllocations, setDataProcessing } =
  projectsSlice.actions;
export default projectsSlice.reducer;
