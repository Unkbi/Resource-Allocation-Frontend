import { createSlice } from '@reduxjs/toolkit';
import {
  getAllOrganizations,
  getOrganizationAllocations,
} from '@/app/services/organizationServices';

const initialState = {
  organizations: null,
  allocations: [],
  loading: false,
  dataProcessing: false,
  error: null,
};

const organizationsSlice = createSlice({
  name: 'organizations',
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
    resetResources: state => {
      state.resources = [];
    },
    setTeamsResources: (state, action) => {
      state.teamsResources[action.payload.id] = action.payload.resource;
    },
  },
  extraReducers: builder => {
    builder
      //Handle getAllOrganizations API call
      .addCase(getAllOrganizations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(getAllOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle getOrganizationAllocations API call
      .addCase(getOrganizationAllocations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationAllocations.fulfilled, state => {
        state.loading = false;
      })
      .addCase(getOrganizationAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateAllocations, resetAllocations, setDataProcessing } =
  organizationsSlice.actions;
export default organizationsSlice.reducer;
