import { call, put, takeLatest } from 'redux-saga/effects';
import {
  ADD_SCALAR_SETTING,
  FETCH_ALL_SETTINGS,
  FETCH_SCALAR_SETTINGS,
  UPDATE_SCALAR_SETTING,
} from '../actions/allSettingsActions';
import {
  setAllSettings,
  setLoading,
  setScalarSettings,
} from '../reducers/allSettingsReducer';
import {
  addScalarSettings,
  fetchAllSystemSettings,
  fetchScalarSettings,
  updateScalarSetting,
} from '@/app/services/allSettingsServices';

function* fetchAllSettingsSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const responses = yield call(fetchAllSystemSettings);

    yield put(setAllSettings(responses?.GetAllSettingsOut));
  } catch (error) {
    console.error('Saga error, Failed to fetch System Settings : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchScalarSettingsSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const responses = yield call(fetchScalarSettings);

    yield put(setScalarSettings(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Scalar Settings : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* addScalarSettingSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(addScalarSettings, postData);

    yield call(fetchScalarSettingsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to add Scalar Setting : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateScalarSettingSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateScalarSetting, postData);

    yield call(fetchScalarSettingsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Scalar Setting : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

// attaching actions to watchers
export function* allSettingsSaga() {
  yield takeLatest(FETCH_ALL_SETTINGS, fetchAllSettingsSaga);
  yield takeLatest(FETCH_SCALAR_SETTINGS, fetchScalarSettingsSaga);
  yield takeLatest(ADD_SCALAR_SETTING, addScalarSettingSaga);
  yield takeLatest(UPDATE_SCALAR_SETTING, updateScalarSettingSaga);
}
