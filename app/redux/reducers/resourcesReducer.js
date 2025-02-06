import { createSlice } from '@reduxjs/toolkit';
import { getAllResources } from '@/app/services/resourceServices';

const initialState = {
  resources: null,
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
        state.resources = action.payload;
      })
      .addCase(getAllResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default resourcesSlice.reducer;
