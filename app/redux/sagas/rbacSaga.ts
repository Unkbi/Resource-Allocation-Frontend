import {
  createPrivilege,
  createPrivilegeAssignment,
  createRole,
  createRoleAssignment,
  deletePrivilege,
  deletePrivilegeAssignment,
  deleteRole,
  deleteRoleAssignment,
  fetchPrivilegeAssignments,
  fetchPrivileges,
  fetchRoleAssignments,
  fetchRoles,
} from '@/app/services/rbacServices';
import { call, put, takeEvery } from 'redux-saga/effects';
import {
  setLoading,
  setPrivilegeAssignments,
  setPrivileges,
  setRoleAssignments,
  setRoles,
} from '../reducers/rbacReducer';
import {
  CREATE_PRIVILEGE,
  CREATE_PRIVILEGEASSIGNMENT,
  CREATE_ROLE,
  CREATE_ROLESASSIGNMENT,
  DELETE_PRIVILEGE,
  DELETE_PRIVILEGEASSIGNMENT,
  DELETE_ROLE,
  DELETE_ROLESASSIGNMENT,
  FETCH_PRIVILEGEASSIGNMENTS,
  FETCH_PRIVILEGES,
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
function* fetchPrivilegesSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchPrivileges);

    yield put(setPrivileges(responses?.result));
  } catch (error) {
    console.error('Saga error, Failed to fetch Privileges : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createPrivilegeSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(createPrivilege, postData);
    yield call(fetchPrivilegesSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Privilege : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deletePrivilegeSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const name = action.payload;
    yield call(deletePrivilege, name);
    yield call(fetchPrivilegesSaga);
  } catch (error) {
    console.error('Saga error, Failed to delete Privilege : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchPrivilegeAssignmentsSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchPrivilegeAssignments);

    yield put(setPrivilegeAssignments(responses?.result));
  } catch (error) {
    console.error(
      'Saga error, Failed to fetch Privilege Assignments : ',
      error
    );
  } finally {
    yield put(setLoading(false));
  }
}

function* createPrivilegeAssignmentSaga(
  action: any
): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(createPrivilegeAssignment, postData);
    yield call(fetchPrivilegeAssignmentsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error(
      'Saga error, Failed to create Privilege Assignment : ',
      error
    );
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deletePrivilegeAssignmentSaga(
  action: any
): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const name = action.payload;
    yield call(deletePrivilegeAssignment, name);
    yield call(fetchPrivilegeAssignmentsSaga);
  } catch (error) {
    console.error(
      'Saga error, Failed to delete Privilege Assignment : ',
      error
    );
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
  yield takeEvery(FETCH_PRIVILEGES, fetchPrivilegesSaga);
  yield takeEvery(CREATE_PRIVILEGE, createPrivilegeSaga);
  yield takeEvery(DELETE_PRIVILEGE, deletePrivilegeSaga);
  yield takeEvery(FETCH_PRIVILEGEASSIGNMENTS, fetchPrivilegeAssignmentsSaga);
  yield takeEvery(CREATE_PRIVILEGEASSIGNMENT, createPrivilegeAssignmentSaga);
  yield takeEvery(DELETE_PRIVILEGEASSIGNMENT, deletePrivilegeAssignmentSaga);
}
