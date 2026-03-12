// Custom Report Reducer

import { CustomReportState } from '@/app/types/customReportTypes';
import {
  FETCH_CUSTOM_REPORT_REQUEST,
  FETCH_CUSTOM_REPORT_SUCCESS,
  FETCH_CUSTOM_REPORT_FAILURE,
  RESET_CUSTOM_REPORT,
  SET_CUSTOM_REPORT_FILTERS,
  FETCH_ALLOCATION_CAPACITY_REQUEST,
  FETCH_ALLOCATION_CAPACITY_SUCCESS,
  FETCH_ALLOCATION_CAPACITY_FAILURE,
  RESET_ALLOCATION_CAPACITY,
} from '../actions/customReportActions';

const initialState: CustomReportState & {
  allocationCapacityReport: any | null;
  allocationCapacityLoading: boolean;
  allocationCapacityError: string | null;
} = {
  currentReport: null,
  loading: false,
  error: null,
  filters: {
    show_actuals: false,
  },
  allocationCapacityReport: null,
  allocationCapacityLoading: false,
  allocationCapacityError: null,
};

export const customReportReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case FETCH_CUSTOM_REPORT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_CUSTOM_REPORT_SUCCESS:
      return {
        ...state,
        loading: false,
        currentReport: action.payload,
        error: null,
      };
    case FETCH_CUSTOM_REPORT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case RESET_CUSTOM_REPORT:
      return {
        ...state,
        currentReport: null,
        error: null,
      };
    case SET_CUSTOM_REPORT_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case FETCH_ALLOCATION_CAPACITY_REQUEST:
      return {
        ...state,
        allocationCapacityLoading: true,
        allocationCapacityError: null,
      };
    case FETCH_ALLOCATION_CAPACITY_SUCCESS:
      return {
        ...state,
        allocationCapacityLoading: false,
        allocationCapacityReport: action.payload,
        allocationCapacityError: null,
      };
    case FETCH_ALLOCATION_CAPACITY_FAILURE:
      return {
        ...state,
        allocationCapacityLoading: false,
        allocationCapacityError: action.payload,
      };
    case RESET_ALLOCATION_CAPACITY:
      return {
        ...state,
        allocationCapacityReport: null,
        allocationCapacityError: null,
      };
    default:
      return state;
  }
};
