import {
  postResourceAllocations,
  putResourceAllocations,
} from '@/app/services/allocationServices';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  allocation: null,
  loading: false,
  error: null,
};

const resourceAllocationsSlice = createSlice({
  name: 'resourceAllocations',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder;
    // Handle post resource allocation
    builder
      .addCase(postResourceAllocations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postResourceAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload;
      })
      .addCase(postResourceAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle put resource allocation
    builder
      .addCase(putResourceAllocations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(putResourceAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocation = action.payload;
      })
      .addCase(putResourceAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default resourceAllocationsSlice.reducer;
