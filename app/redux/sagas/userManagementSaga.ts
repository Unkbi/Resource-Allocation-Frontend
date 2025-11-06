import { call, put, takeEvery, all } from 'redux-saga/effects';
import {
  setLoading,
  setUsers,
  setUserResources,
} from '../reducers/allSettingsReducer';
import {
    fetchUser,
    addUser,
    updateUser,
    deleteUser,
    sendInvite,
    deactivateUser,
    activateUser,
    fetchUserResource,
    resendInvite,
} from '../../services/userManagementServices';
import {fetchRoleAssignments,
    fetchRoles,
    } from '../../services/rbacServices';
import {fetchAllResourcesDetail} from '../../services/allResourcesDetailServices';
import {
  CREATE_USER,
  UPDATE_USER,
  DELETE_USER,
  FETCH_USER,
  SEND_INVITATION,
  DEACTIVATE_USER,
  ACTIVATE_USER,
  FETCH_USER_RESOURCE,
  RESEND_INVITATION,
} from '../actions/allSettingsActions';
import { formatAPIResponse } from '@/app/utils/authUtils';

function* fetchUserSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    // Fetch all required data in parallel using saga's all() effect
    const [users, roleAssignments, roles, allResourcesDetail] = yield all([
      call(fetchUser),
      call(fetchRoleAssignments),
      call(fetchRoles),
      call(fetchAllResourcesDetail),
    ]);
    
    const finaluser = formatAPIResponse('User', users);
    const finalroleAssignments = formatAPIResponse('UserRole', roleAssignments);
    const finalroles = formatAPIResponse('Role', roles);
    const finalallResourcesDetail = formatAPIResponse('ResourceDetail', allResourcesDetail);
    // Transform the data
    const userData = finaluser.map((usr: any) => {
      const resource = finalallResourcesDetail.find(
        (res: any) => res.Resource?.Resource?.Email === usr.email
      );
      const roleAssignment = finalroleAssignments.find(
        (role: any) => role.User === usr.__path__
      );
      const role = finalroles.find(
        (r: any) => r.__path__ === roleAssignment?.Role
      );
      return {
        User:{
        id: usr.id,
        Name: usr.firstName + ' ' + usr.lastName,
        email: usr.email,
        resourceLink: resource ? resource.Resource?.Resource?.Status : 'NA',
        roleAssignment: roleAssignment && role ? role.name : 'user',
        status: usr.status,
      }
    };
    });
    yield put(setUsers(userData));
  } catch (error) {
    console.error('Saga error, Failed to fetch Users : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createUserSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
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

function* sendInviteSaga(action: any): Generator<any, void, any> {
  const { userData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(sendInvite, userData);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to send invite : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* resendInviteSaga(action: any): Generator<any, void, any> {
  const { userData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(resendInvite, userData);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to resend invite : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deactivateUserSaga(action: any): Generator<any, void, any> {
  const { userData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(deactivateUser, userData);
    yield call(fetchUserSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to deactivate User : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* activateUserSaga(action: any): Generator<any, void, any> {
  const { userData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(activateUser, userData);
    yield call(fetchUserSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to reactivate User : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchUserResourceSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchUserResource);
    yield put(setUserResources(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch User Resources : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* userManagementSaga() {
  yield takeEvery(CREATE_USER, createUserSaga);
  yield takeEvery(FETCH_USER, fetchUserSaga);
  yield takeEvery(UPDATE_USER, updateUserSaga);
  yield takeEvery(SEND_INVITATION, sendInviteSaga);
  yield takeEvery(RESEND_INVITATION, resendInviteSaga);
  yield takeEvery(DELETE_USER, deleteUserSaga);
  yield takeEvery(DEACTIVATE_USER, deactivateUserSaga);
  yield takeEvery(ACTIVATE_USER, activateUserSaga);
  yield takeEvery(FETCH_USER_RESOURCE, fetchUserResourceSaga);
}
