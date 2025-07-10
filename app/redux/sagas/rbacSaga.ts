import {
  createRole,
  createRoleAssignment,
  deleteRole,
  deleteRoleAssignment,
  fetchRoleAssignments,
  fetchRoles,
} from '@/app/services/rbacServices';
import { call, put, takeEvery } from 'redux-saga/effects';
import {
  setLoading,
  setRoleAssignments,
  setRoles,
} from '../reducers/rbacReducer';
import {
  CREATE_ROLE,
  CREATE_ROLESASSIGNMENT,
  DELETE_ROLE,
  DELETE_ROLESASSIGNMENT,
  FETCH_ROLES,
  FETCH_ROLESASSIGNMENTS,
} from '../actions/rbacActions';

function* fetchRolesSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchRoles);

    yield put(setRoles(responses?.result));
  } catch (error) {
    console.error('Saga error, Failed to fetch Roles : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createRoleSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    debugger;
    const response = yield call(createRole, postData);
    yield call(fetchRolesSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Role : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteRoleSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const name = action.payload;
    yield call(deleteRole, name);
    yield call(fetchRolesSaga);
  } catch (error) {
    console.error('Saga error, Failed to delete Role : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchRoleAssignmentsSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchRoleAssignments);

    yield put(setRoleAssignments(responses?.result));
  } catch (error) {
    console.error('Saga error, Failed to fetch Role Assignments : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createRoleAssignmentSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    debugger;
    const response = yield call(createRoleAssignment, postData);
    yield call(fetchRoleAssignmentsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Role Assignment : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteRoleAssignmentSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const name = action.payload;
    yield call(deleteRoleAssignment, name);
    yield call(fetchRoleAssignments);
  } catch (error) {
    console.error('Saga error, Failed to delete Role Assignment : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* rbacSaga() {
  yield takeEvery(FETCH_ROLES, fetchRolesSaga);
  yield takeEvery(CREATE_ROLE, createRoleSaga);
  yield takeEvery(DELETE_ROLE, deleteRoleSaga);
  yield takeEvery(FETCH_ROLESASSIGNMENTS, fetchRoleAssignmentsSaga);
  yield takeEvery(CREATE_ROLESASSIGNMENT, createRoleAssignmentSaga);
  yield takeEvery(DELETE_ROLESASSIGNMENT, deleteRoleAssignmentSaga);
}
