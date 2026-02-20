import { createAction } from '@reduxjs/toolkit';
import { ChartParams, ReportUIFilters, ReportType } from '../../types/dashboardTypes';

// This is used by saga to trigger API fetch
export const fetchDashboardChart = createAction<ChartParams>('dashboard/fetchDashboardChart');

// Batch fetch for inventory metrics (single API call for 5 charts)
export const fetchInventoryMetrics = createAction<ChartParams>('dashboard/fetchInventoryMetrics');

// Reports: trigger server fetch for a specific report type with UI filters
export const fetchReport = createAction<{ reportType: ReportType; uiFilters: ReportUIFilters }>(
	'dashboard/fetchReport'
);
