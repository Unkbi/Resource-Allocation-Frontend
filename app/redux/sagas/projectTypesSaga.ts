import { call, put, takeEvery } from 'redux-saga/effects';
import { setLoading, setProjectTypes } from '../reducers/allSettingsReducer';
import {
  addProjectType,
  deleteProjectType,
  fetchProjectTypes,
  updateProjectType,
} from '@/app/services/projectTypeServices';
import {
  ADD_PROJECT_TYPE,
  DELETE_PROJECT_TYPE,
  FETCH_PROJECT_TYPES,
  UPDATE_PROJECT_TYPE,
} from '../actions/allSettingsActions';

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

function* createProjectTypeSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(addProjectType, postData);

    yield call(fetchProjectTypesSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Project Type : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateProjectTypeSaga(action: any): Generator<any, void, any> {
  const { postData, projectTypeId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateProjectType, postData, projectTypeId);

    yield call(fetchProjectTypesSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Project Type : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteProjectTypeSaga(action: any): Generator<any, void, any> {
  const { projectTypeId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(deleteProjectType, projectTypeId);
    yield call(fetchProjectTypesSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to delete Project Type : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* projectTypesSaga() {
  yield takeEvery(FETCH_PROJECT_TYPES, fetchProjectTypesSaga);
  yield takeEvery(ADD_PROJECT_TYPE, createProjectTypeSaga);
  yield takeEvery(UPDATE_PROJECT_TYPE, updateProjectTypeSaga);
  yield takeEvery(DELETE_PROJECT_TYPE, deleteProjectTypeSaga);
}
