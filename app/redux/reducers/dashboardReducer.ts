import { createSlice } from '@reduxjs/toolkit';
import { DashboardChartState, ReportEntry, ReportType } from '@/app/types/dashboardTypes';
import { formatAPIResponse } from '@/app/utils/authUtils';

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
  report: {
    projectsOnly: { loading: false, data: [], error: null },
    resourceOnly: { loading: false, data: [], error: null },
    projectPeriod: { loading: false, data: [], error: null },
    resourcePeriod: { loading: false, data: [], error: null },
    resourceProjectPeriod: { loading: false, data: [], error: null },
    resourceProjectPeriodCost: { loading: false, data: [], error: null },
  },
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

    // Reports reducers
    startReportLoading: (state, action) => {
      const reportType: ReportType = action.payload.reportType;
      state.report![reportType] = {
        ...(state.report?.[reportType] || { data: [], error: null }),
        loading: true,
        error: null,
      } as ReportEntry;
    },
    setReportData: (state, action) => {
      const { reportType, data } = action.payload as { reportType: ReportType; data: any[] };
      state.report![reportType] = {
        ...(state.report?.[reportType] || { error: null }),
        loading: false,
        data: reportType === 'resourceProjectPeriodCost' ? formatAPIResponse('AllocationCostReportDetail', data): reportType === 'resourceProjectPeriod' ? formatAPIResponse('AllocationActualsDetail', data) : reportType === 'resourcePeriod' ? formatAPIResponse('ResourcePeriodActualsDetail', data) : reportType === 'projectPeriod' ? formatAPIResponse('ProjectPeriodDetail', data) : reportType === 'resourceOnly' ? formatAPIResponse('ResourceWithDetails', data) : reportType === 'projectsOnly' ? formatAPIResponse('ProjectWithDetails', data) : data,
      } as ReportEntry;
    },
    setReportError: (state, action) => {
      const { reportType, error } = action.payload as { reportType: ReportType; error: string };
      state.report![reportType] = {
        ...(state.report?.[reportType] || { data: [] }),
        loading: false,
        error,
      } as ReportEntry;
    },
    setReportRequestPayload: (state, action) => {
      const { reportType, uiFilters, requestPayload } = action.payload as {
        reportType: ReportType;
        uiFilters: any;
        requestPayload: any;
      };
      state.report![reportType] = {
        ...(state.report?.[reportType] || { data: [], error: null, loading: false }),
        uiFilters,
        requestPayload,
      } as ReportEntry;
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
  startReportLoading,
  setReportData,
  setReportError,
  setReportRequestPayload,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
