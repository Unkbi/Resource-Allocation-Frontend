import { createSlice } from '@reduxjs/toolkit';
import { DashboardChartState } from '@/app/types/dashboardTypes';

const initialState: DashboardChartState = {
  advancedFilters: {
    ProjectTypeGroup: [],
    ProjectType: [],
    Team: [],
    Resource: [],
    AllocationManager: [],
    ProjectManager: [],
    Project: [],
    Portfolio: [],
    Organization: [],
  },
  defualtAdvancedFilters: {},
  loadingAdvancedFilters: true,
  loading: false,
  loadingCharts: {},
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardChart: (state, action) => {
      const { chartKey, data } = action.payload;
      state[chartKey] = data;
      // Remove from loading object when data is received
      delete state.loadingCharts[chartKey];
      // Turn off loading if no more charts are loading
      if (Object.keys(state.loadingCharts).length === 0) {
        state.loading = false;
      }
    },
    setDefaultAdvancedFilters: (state, action) => {
      state.defualtAdvancedFilters = action.payload;
    },
    setAdvancedFilters: (state, action) => {
      state.advancedFilters = {
        ...state.advancedFilters,
        ...action.payload,
      };
    },
    clearAdvancedFilters: state => {
      state.advancedFilters = state.defualtAdvancedFilters;
    },
    resetDashboardCharts: state => {
      // Reset all chart data but preserve advanced filters
      const filters = state.advancedFilters;
      return {
        ...initialState,
        advancedFilters: filters,
      };
    },
    setDashboardLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoadingAdvancedFilters: (state, action) => {
      state.loadingAdvancedFilters = action.payload;
    },
    startChartLoading: (state, action) => {
      // Add chart to loading object and set loading to true
      state.loadingCharts[action.payload] = true;
      state.loading = true;
    },
    startMultipleChartsLoading: (state, action) => {
      // Add multiple charts to loading object
      action.payload.forEach((chartKey: string) => {
        state.loadingCharts[chartKey] = true;
      });
      state.loading = true;
    },
  },
});

export const {
  setDashboardChart,
  setDefaultAdvancedFilters,
  setAdvancedFilters,
  clearAdvancedFilters,
  resetDashboardCharts,
  setDashboardLoading,
  setLoadingAdvancedFilters,
  startChartLoading,
  startMultipleChartsLoading,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
