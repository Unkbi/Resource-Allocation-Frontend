import { createSlice } from '@reduxjs/toolkit';
import { getAllTeams } from '@/app/services/teamServices';

const initialState = {
  teams: null,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getAllTeams.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(getAllTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default teamsSlice.reducer;
