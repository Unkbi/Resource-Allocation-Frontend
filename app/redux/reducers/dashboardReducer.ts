import { createSlice } from '@reduxjs/toolkit';

interface DashboardChartState {
  [chartKey: string]: any[];
}

const initialState: DashboardChartState = {};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardChart: (state, action) => {
      const { chartKey, data } = action.payload;
      state[chartKey] = data;
    },
    resetDashboardCharts: () => {
      return {};
    },
  },
});

export const { setDashboardChart, resetDashboardCharts } = dashboardSlice.actions;

export default dashboardSlice.reducer;
