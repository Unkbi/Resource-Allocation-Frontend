import {
  createPrivilege,
  createPrivilegeAssignment,
  createRole,
  createRoleAssignment,
  deletePrivilege,
  deletePrivilegeAssignment,
  deleteRole,
  deleteRoleAssignment,
  fetchMeta,
  fetchPrivilegeAssignments,
  fetchPrivileges,
  fetchRoleAssignments,
  fetchRoles,
  fetchUser,
  updatePrivilege,
  updatePrivilegeAssignment,
  updateRoleAssigment,
} from '@/app/services/rbacServices';
import { call, put, select, take, takeEvery } from 'redux-saga/effects';
import {
  setLoading,
  setLoginUpserPrivileges,
  setMeta,
  setPrivilegeAssignments,
  setPrivileges,
  setRoleAssignments,
  setRoles,
  setUser,
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
  UPDATE_PRIVILEGE,
  UPDATE_PRIVILEGEASSIGNMENT,
  GET_USER,
  GET_USER_AND_PRIVILEGES,
  GET_META,
  UPDATE_ROLESASSIGNMENT,
} from '../actions/rbacActions';
import { getUser } from '@/app/services/authServices';
import { buildLoginUserPrivileges } from '@/app/utils/authUtils';

function* fetchRolesSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchRoles);

    yield put(setRoles(responses));
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

    yield put(setRoleAssignments(responses));
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

function* updateRoleAssignmentSaga(action: any): Generator<any, void, any> {
  const { updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateRoleAssigment, updatedFields);
    yield call(fetchRoleAssignmentsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Role Assignment : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteRoleAssignmentSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const { User, Role } = action.payload;
    yield call(deleteRoleAssignment, User, Role);
    yield call(fetchRoleAssignmentsSaga);
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

    yield put(setPrivileges(responses));
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

function* updatePrivilegeSaga(action: any): Generator<any, void, any> {
  const { id, updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updatePrivilege, id, updatedFields);
    yield call(fetchPrivilegesSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Privilege  : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchPrivilegeAssignmentsSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchPrivilegeAssignments);

    yield put(setPrivilegeAssignments(responses));
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

function* updatePrivilegeAssignmentSaga(
  action: any
): Generator<any, void, any> {
  const { updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updatePrivilegeAssignment, updatedFields);
    yield call(fetchPrivilegeAssignmentsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error(
      'Saga error, Failed to update Privilege Assignment : ',
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
    const { Role, Permission } = action.payload;
    yield call(deletePrivilegeAssignment, Role, Permission);
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

function* getUserSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchUser);

    yield put(setUser(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch User : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* getUserAndPrivilegesSaga(action: any): Generator<any, void, any> {
  try {
    const { userId } = action.payload;
    yield put(setLoading(true));

    let user = yield select(state => state.user.user);
    if (!user) {
      yield put(getUser(userId));
      yield take(getUser.fulfilled.type);

      user = yield select(state => state.user.user);
    }

    // Not needed to fetch role Privileges
    // yield call(fetchRolesSaga);
    // const roles = yield select(state => state.rbac.roles);

    let roleAssignments = yield select(state => state.rbac.roleAssignments);
    if (!roleAssignments || roleAssignments.length === 0) {
      yield call(fetchRoleAssignmentsSaga);
      roleAssignments = yield select(state => state.rbac.roleAssignments);
    }

    let privileges = yield select(state => state.rbac.privileges);
    if (!privileges || privileges.length === 0) {
      yield call(fetchPrivilegesSaga);
      privileges = yield select(state => state.rbac.privileges);
    }

    let privilegeAssignments = yield select(
      state => state.rbac.privilegeAssignments
    );
    if (!privilegeAssignments || privilegeAssignments.length === 0) {
      yield call(fetchPrivilegeAssignmentsSaga);
      privilegeAssignments = yield select(
        state => state.rbac.privilegeAssignments
      );
    }

    const loginUserPrivileges = buildLoginUserPrivileges(
      user,
      roleAssignments,
      privilegeAssignments,
      privileges
    );
    yield put(setLoginUpserPrivileges(loginUserPrivileges));
  } catch (error) {
    console.error('Saga error, Failed to fetch User and Privileges : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* getMetaSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const responses = yield call(fetchMeta);
    yield put(setMeta(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Meta : ', error);
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
  yield takeEvery(UPDATE_ROLESASSIGNMENT, updateRoleAssignmentSaga);
  yield takeEvery(DELETE_ROLESASSIGNMENT, deleteRoleAssignmentSaga);
  yield takeEvery(FETCH_PRIVILEGES, fetchPrivilegesSaga);
  yield takeEvery(CREATE_PRIVILEGE, createPrivilegeSaga);
  yield takeEvery(DELETE_PRIVILEGE, deletePrivilegeSaga);
  yield takeEvery(UPDATE_PRIVILEGE, updatePrivilegeSaga);
  yield takeEvery(FETCH_PRIVILEGEASSIGNMENTS, fetchPrivilegeAssignmentsSaga);
  yield takeEvery(CREATE_PRIVILEGEASSIGNMENT, createPrivilegeAssignmentSaga);
  yield takeEvery(UPDATE_PRIVILEGEASSIGNMENT, updatePrivilegeAssignmentSaga);
  yield takeEvery(DELETE_PRIVILEGEASSIGNMENT, deletePrivilegeAssignmentSaga);
  yield takeEvery(GET_USER, getUserSaga);
  yield takeEvery(GET_USER_AND_PRIVILEGES, getUserAndPrivilegesSaga);
  yield takeEvery(GET_META, getMetaSaga);
}
