import { createSlice } from '@reduxjs/toolkit';
import { SavedReportsState } from '@/app/types/savedReportsTypes';

const initialState: SavedReportsState = {
  savedReports: [],
  loading: false,
  error: null,
};

const savedReportsSlice = createSlice({
  name: 'savedReports',
  initialState,
  reducers: {
    setSavedReports: (state, action) => {
      state.savedReports = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSavedReportsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSavedReportsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addSavedReport: (state, action) => {
      state.savedReports.push(action.payload);
    },
    updateSavedReport: (state, action) => {
      const index = state.savedReports.findIndex(
        report => report.Id === action.payload.Id
      );
      if (index !== -1) {
        state.savedReports[index] = action.payload;
      }
    },
    removeSavedReport: (state, action) => {
      state.savedReports = state.savedReports.filter(
        report => report.Id !== action.payload
      );
    },
  },
});

export const {
  setSavedReports,
  setSavedReportsLoading,
  setSavedReportsError,
  addSavedReport,
  updateSavedReport,
  removeSavedReport,
} = savedReportsSlice.actions;

export default savedReportsSlice.reducer;
