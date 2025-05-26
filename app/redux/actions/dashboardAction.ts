import { createAction } from '@reduxjs/toolkit';
import { ChartParams } from '../../types/dashboardTypes';

// This is used by saga to trigger API fetch
export const fetchDashboardChart = createAction<ChartParams>('dashboard/fetchDashboardChart');
