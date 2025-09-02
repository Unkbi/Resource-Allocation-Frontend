import { call, put, takeEvery } from 'redux-saga/effects';
import { setLoading, setProjectTypes, setProjectTypeGroups } from '../reducers/allSettingsReducer';
import {
  addProjectType,
  deleteProjectType,
  fetchProjectTypes,
  updateProjectType,
  addProjectTypeGroups,
  updateProjectTypeGroups,
  deleteProjectTypeGroups,
  fetchProjectTypeGroups
} from '@/app/services/projectTypeServices';
import {
  ADD_PROJECT_TYPE,
  DELETE_PROJECT_TYPE,
  FETCH_PROJECT_TYPES,
  UPDATE_PROJECT_TYPE,
  FETCH_PROJECT_TYPE_GROUPS,
  ADD_PROJECT_TYPE_GROUPS,
  UPDATE_PROJECT_TYPE_GROUPS,
  DELETE_PROJECT_TYPE_GROUPS
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

function* fetchProjectTypeGroupsSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchProjectTypeGroups);

    yield put(setProjectTypeGroups(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch ProjectTypeGroups : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createProjectTypeGroupsSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(addProjectTypeGroups, postData);

    yield call(fetchProjectTypeGroupsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Project Type Group : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateProjectTypeGroupsSaga(action: any): Generator<any, void, any> {
  const { postData, projectTypeGroupId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateProjectTypeGroups, postData, projectTypeGroupId);

    yield call(fetchProjectTypeGroupsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Project Type Group : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteProjectTypeGroupsSaga(action: any): Generator<any, void, any> {
  const { projectTypeGroupId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(deleteProjectTypeGroups, projectTypeGroupId);
    yield call(fetchProjectTypeGroupsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to delete Project Type Group : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* projectTypesSaga() {
  yield takeEvery(FETCH_PROJECT_TYPES, fetchProjectTypesSaga);
  yield takeEvery(ADD_PROJECT_TYPE, createProjectTypeSaga);
  yield takeEvery(UPDATE_PROJECT_TYPE, updateProjectTypeSaga);
  yield takeEvery(FETCH_PROJECT_TYPE_GROUPS, fetchProjectTypeGroupsSaga);
  yield takeEvery(ADD_PROJECT_TYPE_GROUPS, createProjectTypeGroupsSaga);
  yield takeEvery(UPDATE_PROJECT_TYPE_GROUPS, updateProjectTypeGroupsSaga);
  yield takeEvery(DELETE_PROJECT_TYPE_GROUPS, deleteProjectTypeGroupsSaga);
  yield takeEvery(DELETE_PROJECT_TYPE, deleteProjectTypeSaga);
}
