import { call, put, takeEvery } from 'redux-saga/effects';
import {
  setLoading,
  setUsers,
} from '../reducers/allSettingsReducer';
import {
    fetchUser,
    addUser,
    updateUser,
    deleteUser,
} from '../../services/userManagementServices';
import {
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  FETCH_USER,
} from '../actions/allSettingsActions';

function* fetchUserSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchUser);

    yield put(setUsers(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Users : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createUserSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    console.log('Saga received postData:', postData);
    yield put(setLoading(true));
    const response = yield call(addUser, postData);

    yield call(fetchUserSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create User : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateUserSaga(action: any): Generator<any, void, any> {
  const { postData, userId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateUser, postData, userId);

    yield call(fetchUserSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update User : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteUserSaga(action: any): Generator<any, void, any> {
  const { userId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(deleteUser, userId);
    yield call(fetchUserSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to delete User : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}


export function* userManagementSaga() {
  yield takeEvery(CREATE_USER, createUserSaga);
  yield takeEvery(FETCH_USER, fetchUserSaga);
  yield takeEvery(UPDATE_USER, updateUserSaga);
  yield takeEvery(DELETE_USER, deleteUserSaga);
}
