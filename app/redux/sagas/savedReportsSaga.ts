import { call, put, takeEvery, select } from 'redux-saga/effects';
import {
  FETCH_SAVED_REPORTS,
  CREATE_SAVED_REPORT,
  DELETE_SAVED_REPORT,
  UPDATE_SAVED_REPORT,
} from '../actions/savedReportsActions';
import {
  setSavedReports,
  setSavedReportsLoading,
  setSavedReportsError,
  addSavedReport,
  removeSavedReport,
  updateSavedReport as updateSavedReportReducer,
} from '../reducers/savedReportsReducer';
import {
  fetchSavedReportsAPI,
  createSavedReportAPI,
  deleteSavedReportAPI,
  updateSavedReportAPI,
} from '@/app/services/savedReportsServices';
import { SavedReport } from '@/app/types/savedReportsTypes';
import { RootState } from '../store';

function* fetchSavedReportsSaga(action: {
  type: string;
  payload: { userId: string };
}): Generator<any, void, any> {
  try {
    yield put(setSavedReportsLoading(true));
    const { userId } = action.payload;
    const reports: SavedReport[] = yield call(fetchSavedReportsAPI, userId);
    yield put(setSavedReports(reports));
  } catch (error: any) {
    console.error('Failed to fetch saved reports:', error);
    yield put(setSavedReportsError(error?.message || 'Failed to fetch saved reports'));
  }
}

function* createSavedReportSaga(action: {
  type: string;
  payload: {
    reportData: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}): Generator<any, void, any> {
  try {
    const { reportData, resolve, reject } = action.payload;
    const savedReport: SavedReport = yield call(createSavedReportAPI, reportData);
    yield put(addSavedReport(savedReport));
    resolve(savedReport);
  } catch (error: any) {
    console.error('Failed to create saved report:', error);
    action.payload.reject(error);
  }
}

function* deleteSavedReportSaga(action: {
  type: string;
  payload: {
    reportId: string;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}): Generator<any, void, any> {
  try {
    const { reportId, resolve, reject } = action.payload;
    yield call(deleteSavedReportAPI, reportId);
    yield put(removeSavedReport(reportId));
    resolve({ success: true });
  } catch (error: any) {
    console.error('Failed to delete saved report:', error);
    action.payload.reject(error);
  }
}

function* updateSavedReportSaga(action: {
  type: string;
  payload: {
    reportId: string;
    reportData: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}): Generator<any, void, any> {
  try {
    const { reportId, reportData, resolve, reject } = action.payload;
    const updatedReport: SavedReport = yield call(updateSavedReportAPI, reportId, reportData);
    yield put(updateSavedReportReducer(updatedReport));
    resolve(updatedReport);
  } catch (error: any) {
    console.error('Failed to update saved report:', error);
    action.payload.reject(error);
  }
}

export default function* savedReportsSaga() {
  yield takeEvery(FETCH_SAVED_REPORTS, fetchSavedReportsSaga);
  yield takeEvery(CREATE_SAVED_REPORT, createSavedReportSaga);
  yield takeEvery(DELETE_SAVED_REPORT, deleteSavedReportSaga);
  yield takeEvery(UPDATE_SAVED_REPORT, updateSavedReportSaga);
}
