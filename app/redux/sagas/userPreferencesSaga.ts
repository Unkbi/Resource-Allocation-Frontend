import { call, put, takeLatest } from 'redux-saga/effects';
import {
  ADD_USER_PREFERENCES,
  FETCH_USER_PREFERENCES,
  SET_USER_PREFERENCES,
  UPDATE_USER_PREFERENCES,
} from '../actions/userPreferencesActions';
import {
  setLoading,
  setUserPreferences,
} from '../reducers/userPreferencesReducer';
import {
  addUserPreference,
  fetchUserPreferences,
  setUserPreferenceAPI,
  updateUserPreference,
} from '@/app/services/userPreferencesServices';

function* fetchUserPreferencesSaga(action: any): Generator<any, void, any> {
  const { userId } = action.payload;
  if (!userId) return;
  try {
    yield put(setLoading(true));
    const responses = yield call(fetchUserPreferences, userId);

    yield put(setUserPreferences(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch User Preferences : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* addUserPreferencesSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(addUserPreference, postData);

    yield call(fetchUserPreferencesSaga, {
      payload: { userId: postData.User },
    });
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to add User Preferences : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateUserPreferencesSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateUserPreference, postData);

    yield call(fetchUserPreferencesSaga, {
      payload: { userId: postData.User },
    });
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update User Preferences : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* setUserPreferencesSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(setUserPreferenceAPI, postData);

    yield call(fetchUserPreferencesSaga, {
      payload: { userId: postData.User },
    });
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to set User Preferences : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

// attaching actions to watchers
export function* userPreferencesSaga() {
  yield takeLatest(FETCH_USER_PREFERENCES, fetchUserPreferencesSaga);
  yield takeLatest(ADD_USER_PREFERENCES, addUserPreferencesSaga);
  yield takeLatest(UPDATE_USER_PREFERENCES, updateUserPreferencesSaga);
  yield takeLatest(SET_USER_PREFERENCES, setUserPreferencesSaga);
}
