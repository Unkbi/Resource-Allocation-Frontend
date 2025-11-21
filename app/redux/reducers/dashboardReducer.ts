import { createSlice } from '@reduxjs/toolkit';

interface AdvancedFilters {
  ProjectTypeGroup?: string[];
  ProjectType?: string[];
  Team?: string[];
  Resource?: string[];
  AllocationManager?: string[];
  ProjectManager?: string[];
  Project?: string[];
  Portfolio?: string[];
  Organization?: string[];
}

interface DashboardChartState {
  advancedFilters: AdvancedFilters;
  loading: boolean;
  loadingCharts: Record<string, boolean>;
  [chartKey: string]: any[] | AdvancedFilters | boolean | Record<string, boolean>;
}

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
    clearAdvancedFilters: (state) => {
      state.advancedFilters = {
        ProjectTypeGroup: [],
        ProjectType: [],
        Team: [],
        Resource: [],
        AllocationManager: [],
        ProjectManager: [],
        Project: [],
        Portfolio: [],
        Organization: [],
      };
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

export const { setDashboardChart, setAdvancedFilters, clearAdvancedFilters, resetDashboardCharts, setDashboardLoading, startChartLoading, startMultipleChartsLoading } = dashboardSlice.actions;

export default dashboardSlice.reducer;
