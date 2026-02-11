// Custom Report Saga

import { call, put, takeLatest } from 'redux-saga/effects';
import {
  FETCH_CUSTOM_REPORT_REQUEST,
  fetchCustomReportSuccess,
  fetchCustomReportFailure,
} from '../actions/customReportActions';
import { fetchCustomReport } from '@/app/services/customReportServices';
import { CustomReportResponse } from '@/app/types/customReportTypes';

function* fetchCustomReportSaga(action: any): Generator<any, void, any> {
  try {
    const response: CustomReportResponse = yield call(fetchCustomReport, action.payload);
    yield put(fetchCustomReportSuccess(response));
  } catch (error: any) {
    yield put(fetchCustomReportFailure(error.message || 'Failed to fetch custom report'));
  }
}

export function* customReportSaga() {
  yield takeLatest(FETCH_CUSTOM_REPORT_REQUEST, fetchCustomReportSaga);
}
