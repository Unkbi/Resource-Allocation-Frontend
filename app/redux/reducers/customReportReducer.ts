// Custom Report Reducer

import { CustomReportState } from '@/app/types/customReportTypes';
import {
  FETCH_CUSTOM_REPORT_REQUEST,
  FETCH_CUSTOM_REPORT_SUCCESS,
  FETCH_CUSTOM_REPORT_FAILURE,
  RESET_CUSTOM_REPORT,
  SET_CUSTOM_REPORT_FILTERS,
} from '../actions/customReportActions';

const initialState: CustomReportState = {
  currentReport: null,
  loading: false,
  error: null,
  filters: {
    show_actuals: false,
  },
};

export const customReportReducer = (state = initialState, action: any): CustomReportState => {
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
    default:
      return state;
  }
};
