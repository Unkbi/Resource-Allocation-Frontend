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
  [chartKey: string]: any[] | AdvancedFilters;
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
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardChart: (state, action) => {
      const { chartKey, data } = action.payload;
      state[chartKey] = data;
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
    resetDashboardCharts: (state) => {
      // Reset all chart data but preserve advanced filters
      const filters = state.advancedFilters;
      return {
        ...initialState,
        advancedFilters: filters,
      };
    },
  },
});

export const { setDashboardChart, setAdvancedFilters, clearAdvancedFilters, resetDashboardCharts } = dashboardSlice.actions;

export default dashboardSlice.reducer;
