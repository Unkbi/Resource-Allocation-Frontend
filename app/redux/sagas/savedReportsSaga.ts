import { call, put, takeEvery } from 'redux-saga/effects';
import {
  FETCH_SAVED_REPORTS,
  SAVE_REPORTS,
  DELETE_SAVED_REPORT,
  UPDATE_SAVED_REPORT,
} from '../actions/savedReportsActions';
import {
  setSavedReports,
  setSavedReportsLoading,
  setSavedReportsError,
  addSavedReport,
  removeSavedReport,
  updateSavedReport,
} from '../reducers/savedReportsReducer';
import {
  fetchSavedReportsAPI,
  saveReportAPI,
  deleteSavedReportAPI,
  updateSavedReportAPI,
} from '@/app/services/savedReportsServices';
import { SavedReport } from '@/app/types/savedReportsTypes';

function* fetchSavedReportsSaga(): Generator<any, void, any> {
  try {
    yield put(setSavedReportsLoading(true));
    const reports: SavedReport[] = yield call(fetchSavedReportsAPI);
    yield put(setSavedReports(reports));
  } catch (error: any) {
    console.error('Failed to fetch saved reports:', error);
    yield put(setSavedReportsError(error?.message || 'Failed to fetch saved reports'));
  }
}

function* saveReportSaga(action: {
  type: string;
  payload: {
    postData: {
      Name: string;
      Description?: string;
      Filters: any;
      ReportType: string;
    };
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}): Generator<any, void, any> {
  try {
    const { postData, resolve, reject } = action.payload;
    const savedReport: SavedReport = yield call(saveReportAPI, postData);
    yield put(addSavedReport(savedReport));
    resolve(savedReport);
  } catch (error: any) {
    console.error('Failed to save report:', error);
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
    reportData: Partial<SavedReport>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}): Generator<any, void, any> {
  try {
    const { reportId, reportData, resolve, reject } = action.payload;
    const updatedReport: SavedReport = yield call(updateSavedReportAPI, reportId, reportData);
    yield put(updateSavedReport(updatedReport));
    resolve(updatedReport);
  } catch (error: any) {
    console.error('Failed to update saved report:', error);
    action.payload.reject(error);
  }
}

export default function* savedReportsSaga() {
  yield takeEvery(FETCH_SAVED_REPORTS, fetchSavedReportsSaga);
  yield takeEvery(SAVE_REPORTS, saveReportSaga);
  yield takeEvery(DELETE_SAVED_REPORT, deleteSavedReportSaga);
  yield takeEvery(UPDATE_SAVED_REPORT, updateSavedReportSaga);
}
