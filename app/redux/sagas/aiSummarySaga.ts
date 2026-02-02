import { call, put, takeEvery } from 'redux-saga/effects';
import {
  fetchProjectSummary,
  fetchProjectSummaryHistory,
} from '../actions/aiSummaryAction';
import {
  startSummaryLoading,
  setSummaryData,
  setSummaryError,
  startHistoryLoading,
  setHistoryData,
  setHistoryError,
} from '../reducers/aiSummaryReducer';
import {
  getProjectSummary,
  getProjectSummaryHistory,
  buildSummaryPayload,
} from '@/app/services/aiSummaryServices';
import {
  GetProjectSummaryHistoryRequest,
  ProjectSummaryHistory,
} from '@/app/types/aiSummaryTypes';
import { calculateDateRange } from '@/app/utils/dateUtils';

/**
 * Saga to handle fetching current project summary
 */
function* fetchProjectSummarySaga(
  action: { payload: any }
): Generator<any, void, any> {
  try {
    yield put(startSummaryLoading());
    
    const uiFilters = action.payload;
    
    // Calculate date range using shared utility (same logic as reports)
    const dateRange = calculateDateRange(
      uiFilters.period,
      uiFilters.customStartDate,
      uiFilters.customEndDate
    );
    
    // Add dates to UI filters
    const filtersWithDates = {
      ...uiFilters,
      startDate: dateRange.start,
      endDate: dateRange.end,
    };
    
    // Build API payload using service function
    const apiPayload = buildSummaryPayload(filtersWithDates);
    
    const data: any = yield call(getProjectSummary, apiPayload);
    
    yield put(setSummaryData(data));
  } catch (error: any) {
    console.error('Project summary fetch failed:', error);
    yield put(setSummaryError(error?.message || 'Failed to fetch project summary'));
  }
}

/**
 * Saga to handle fetching project summary history
 */
function* fetchProjectSummaryHistorySaga(
  action: { payload: GetProjectSummaryHistoryRequest }
): Generator<any, void, ProjectSummaryHistory> {
  try {
    yield put(startHistoryLoading());
    
    const data: ProjectSummaryHistory = yield call(
      getProjectSummaryHistory,
      action.payload
    );
    
    yield put(setHistoryData(data));
  } catch (error: any) {
    console.error('Project summary history fetch failed:', error);
    yield put(setHistoryError(error?.message || 'Failed to fetch summary history'));
  }
}

/**
 * Root saga for AI Summary
 */
export function* aiSummarySaga() {
  yield takeEvery(fetchProjectSummary, fetchProjectSummarySaga);
  yield takeEvery(fetchProjectSummaryHistory, fetchProjectSummaryHistorySaga);
}
