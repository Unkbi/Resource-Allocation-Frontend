// Custom Report Actions

import { CustomReportFilters, CustomReportResponse } from '@/app/types/customReportTypes';

export const FETCH_CUSTOM_REPORT_REQUEST = 'FETCH_CUSTOM_REPORT_REQUEST';
export const FETCH_CUSTOM_REPORT_SUCCESS = 'FETCH_CUSTOM_REPORT_SUCCESS';
export const FETCH_CUSTOM_REPORT_FAILURE = 'FETCH_CUSTOM_REPORT_FAILURE';
export const RESET_CUSTOM_REPORT = 'RESET_CUSTOM_REPORT';
export const SET_CUSTOM_REPORT_FILTERS = 'SET_CUSTOM_REPORT_FILTERS';
export const SET_CUSTOM_REPORT_UI_FILTERS = 'SET_CUSTOM_REPORT_UI_FILTERS';

// Allocation Capacity Report Actions
export const FETCH_ALLOCATION_CAPACITY_REQUEST = 'FETCH_ALLOCATION_CAPACITY_REQUEST';
export const FETCH_ALLOCATION_CAPACITY_SUCCESS = 'FETCH_ALLOCATION_CAPACITY_SUCCESS';
export const FETCH_ALLOCATION_CAPACITY_FAILURE = 'FETCH_ALLOCATION_CAPACITY_FAILURE';
export const RESET_ALLOCATION_CAPACITY = 'RESET_ALLOCATION_CAPACITY';

export const fetchCustomReportRequest = (filters: CustomReportFilters, uiFilters?: any, gridFilters?: Record<string, any>) => ({
  type: FETCH_CUSTOM_REPORT_REQUEST,
  payload: filters,
  meta: { uiFilters, gridFilters, reportType: 'percentageAllocation' },
});

export const fetchCustomReportSuccess = (data: CustomReportResponse) => ({
  type: FETCH_CUSTOM_REPORT_SUCCESS,
  payload: data,
});

export const fetchCustomReportFailure = (error: string) => ({
  type: FETCH_CUSTOM_REPORT_FAILURE,
  payload: error,
});

export const resetCustomReport = () => ({
  type: RESET_CUSTOM_REPORT,
});

export const setCustomReportFilters = (filters: CustomReportFilters) => ({
  type: SET_CUSTOM_REPORT_FILTERS,
  payload: filters,
});

export const setCustomReportUIFilters = (uiFilters: any, requestPayload: any, gridFilters?: Record<string, any>, reportType?: string) => ({
  type: SET_CUSTOM_REPORT_UI_FILTERS,
  payload: { uiFilters, requestPayload, gridFilters, reportType: reportType || 'percentageAllocation' },
});

export const fetchAllocationCapacityRequest = (filters: any, uiFilters?: any, gridFilters?: Record<string, any>) => ({
  type: FETCH_ALLOCATION_CAPACITY_REQUEST,
  payload: filters,
  meta: { uiFilters, gridFilters, reportType: 'allocationCapacity' },
});

export const fetchAllocationCapacitySuccess = (data: any) => ({
  type: FETCH_ALLOCATION_CAPACITY_SUCCESS,
  payload: data,
});

export const fetchAllocationCapacityFailure = (error: string) => ({
  type: FETCH_ALLOCATION_CAPACITY_FAILURE,
  payload: error,
});

export const resetAllocationCapacity = () => ({
  type: RESET_ALLOCATION_CAPACITY,
});
