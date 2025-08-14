import { createSlice } from '@reduxjs/toolkit';
import { getAllResources, deleteResource } from '@/app/services/resourceServices';
import { Resource } from '@/app/types/resourceTypes'; 

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
  reducers: {},
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

      .addCase(deleteResource.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload as string;
        state.resources = state.resources.filter(res => res.Id !== deletedId);
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to delete resource';
      });
  },
});

export default resourcesSlice.reducer;