import { call, put, takeEvery } from 'redux-saga/effects';
import { setLoading, setProjectTypes } from '../reducers/allSettingsReducer';
import { fetchProjectTypes } from '@/app/services/projectTypeServices';
import { FETCH_PROJECT_TYPES } from '../actions/allSettingsActions';

function* fetchProjectTypesSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchProjectTypes);

    yield put(setProjectTypes(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch ProjectTypes : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* projectTypesSaga() {
  yield takeEvery(FETCH_PROJECT_TYPES, fetchProjectTypesSaga);
}
