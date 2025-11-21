import { createSlice } from '@reduxjs/toolkit';

export interface AdvancedFilters {
  ProjectTypeGroup?: string;
  ProjectType?: string;
  Team?: string;
  Resource?: string;
  AllocationManager?: string;
  ProjectManager?: string;
  Project?: string;
  Portfolio?: string;
  Organization?: string;
}

interface DashboardChartState {
  defualtAdvancedFilters: AdvancedFilters;
  advancedFilters: AdvancedFilters;
  [chartKey: string]: any[] | AdvancedFilters;
}

const initialState: DashboardChartState = {
  defualtAdvancedFilters: {
    ProjectTypeGroup: '',
    ProjectType: '',
    Team: '',
    Resource: '',
    AllocationManager: '',
    ProjectManager: '',
    Project: '',
    Portfolio: '',
    Organization: '',
  },
  advancedFilters: {
    ProjectTypeGroup: '',
    ProjectType: '',
    Team: '',
    Resource: '',
    AllocationManager: '',
    ProjectManager: '',
    Project: '',
    Portfolio: '',
    Organization: '',
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
  },
});

export const {
  setDashboardChart,
  setDefaultAdvancedFilters,
  setAdvancedFilters,
  clearAdvancedFilters,
  resetDashboardCharts,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
