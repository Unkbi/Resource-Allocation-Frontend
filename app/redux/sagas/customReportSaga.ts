// Custom Report Saga

import { call, put, takeLatest } from 'redux-saga/effects';
import {
  FETCH_CUSTOM_REPORT_REQUEST,
  FETCH_ALLOCATION_CAPACITY_REQUEST,
  fetchCustomReportSuccess,
  fetchCustomReportFailure,
  fetchAllocationCapacitySuccess,
  fetchAllocationCapacityFailure,
} from '../actions/customReportActions';
import { fetchCustomReport, fetchAllocationCapacityReport } from '@/app/services/customReportServices';
import { CustomReportResponse } from '@/app/types/customReportTypes';

function* fetchCustomReportSaga(action: any): Generator<any, void, any> {
  try {
    const response: CustomReportResponse = yield call(fetchCustomReport, action.payload);
    yield put(fetchCustomReportSuccess(response));
  } catch (error: any) {
    yield put(fetchCustomReportFailure(error.message || 'Failed to fetch custom report'));
  }
}

function* fetchAllocationCapacitySaga(action: any): Generator<any, void, any> {
  try {
    const response: any = yield call(fetchAllocationCapacityReport, action.payload);
    yield put(fetchAllocationCapacitySuccess(response));
  } catch (error: any) {
    yield put(fetchAllocationCapacityFailure(error.message || 'Failed to fetch allocation capacity report'));
  }
}

export function* customReportSaga() {
  yield takeLatest(FETCH_CUSTOM_REPORT_REQUEST, fetchCustomReportSaga);
  yield takeLatest(FETCH_ALLOCATION_CAPACITY_REQUEST, fetchAllocationCapacitySaga);
}
