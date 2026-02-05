import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AISummaryState,
  ProjectSummary,
  ProjectSummaryHistory,
} from '@/app/types/aiSummaryTypes';
import { formatAPIResponse } from '@/app/utils/authUtils';

const initialState: AISummaryState = {
  currentSummary: null,
  summaryHistory: null,
  loading: false,
  error: null,
  loadingHistory: false,
  historyError: null,
};

const aiSummarySlice = createSlice({
  name: 'aiSummary',
  initialState,
  reducers: {
    // Current Summary Actions
    startSummaryLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    setSummaryData: (state, action: PayloadAction<any>) => {
      state.currentSummary = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setSummaryError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.currentSummary = null;
    },
    
    clearSummary: (state) => {
      state.currentSummary = null;
      state.error = null;
      state.loading = false;
    },
    
    // Summary History Actions
    startHistoryLoading: (state) => {
      state.loadingHistory = true;
      state.historyError = null;
    },
    
    setHistoryData: (state, action: PayloadAction<ProjectSummaryHistory>) => {
      state.summaryHistory = action.payload;
      state.loadingHistory = false;
      state.historyError = null;
    },
    
    setHistoryError: (state, action: PayloadAction<string>) => {
      state.historyError = action.payload;
      state.loadingHistory = false;
      state.summaryHistory = null;
    },
    
    clearHistory: (state) => {
      state.summaryHistory = null;
      state.historyError = null;
      state.loadingHistory = false;
    },
    
    // Reset all AI summary state
    resetAISummary: () => initialState,
  },
});

export const {
  startSummaryLoading,
  setSummaryData,
  setSummaryError,
  clearSummary,
  startHistoryLoading,
  setHistoryData,
  setHistoryError,
  clearHistory,
  resetAISummary,
} = aiSummarySlice.actions;

export default aiSummarySlice.reducer;
