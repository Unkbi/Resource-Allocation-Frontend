// Custom Report Actions

import { CustomReportFilters, CustomReportResponse } from '@/app/types/customReportTypes';

export const FETCH_CUSTOM_REPORT_REQUEST = 'FETCH_CUSTOM_REPORT_REQUEST';
export const FETCH_CUSTOM_REPORT_SUCCESS = 'FETCH_CUSTOM_REPORT_SUCCESS';
export const FETCH_CUSTOM_REPORT_FAILURE = 'FETCH_CUSTOM_REPORT_FAILURE';
export const RESET_CUSTOM_REPORT = 'RESET_CUSTOM_REPORT';
export const SET_CUSTOM_REPORT_FILTERS = 'SET_CUSTOM_REPORT_FILTERS';

export const fetchCustomReportRequest = (filters: CustomReportFilters) => ({
  type: FETCH_CUSTOM_REPORT_REQUEST,
  payload: filters,
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
