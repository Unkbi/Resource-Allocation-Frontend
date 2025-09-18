import { createSlice } from '@reduxjs/toolkit';
import {
  getAllResources,
  deleteResource,
} from '@/app/services/resourceServices';

import type { Resource } from '@/app/types/resourceTypes';

export interface ResourcesState {
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  resources: [],
  loading: false,
  error: null,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setResources: (state, action) => {
      state.resources = action.payload;
    },
    clearResources: state => {
      state.resources = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAllResources.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload; // auto-typed from thunk
      })
      .addCase(getAllResources.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to fetch resources';
      })

      // Delete resource
      .addCase(deleteResource.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        if (Array.isArray(state.resources)) {
          state.resources = state.resources.filter(res => res.Id !== deletedId);
        }
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to delete resource';
      });
  },
});

export const { setResources, clearResources, setLoading, setError } =
  resourcesSlice.actions;

export default resourcesSlice.reducer;
