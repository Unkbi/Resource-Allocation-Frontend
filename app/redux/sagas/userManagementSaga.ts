import { call, put, takeEvery } from 'redux-saga/effects';
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

function* fetchUserSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const users = yield call(fetchUser);
    const userData = users.map((usr: any) => {
      const createdByUser = users.find((u: any) => u.id === usr.createdBy);
      const lastModifiedByUser = users.find(
        (u: any) => u.id === usr.lastModifiedBy
      );

      return {
        User: {
          id: usr.id,
          Name: usr.firstName + ' ' + usr.lastName,
          email: usr.email,
          resourceLink: 'NA',
          role: usr.role || 'user',
          status: usr.status,
          lastLoginTime: usr.lastLoginTime,
          __created: usr.created,
          __created_by: createdByUser
            ? `${createdByUser?.firstName} ${createdByUser?.lastName}`
            : '',
          __last_modified: usr.lastModified,
          __last_modified_by: lastModifiedByUser
            ? `${lastModifiedByUser?.firstName} ${lastModifiedByUser?.lastName}`
            : '',
        },
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
    yield call(fetchUserResourceSaga);
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
    yield call(fetchUserResourceSaga);
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
    yield call(fetchUserResourceSaga);
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
    yield call(fetchUserSaga);
    yield call(fetchUserResourceSaga);
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
    yield call(fetchUserResourceSaga);
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
    yield call(fetchUserResourceSaga);
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
    const users = yield call(fetchUser);
    const formattedResources = responses.map((res: any) => {
      const createdByUser = users.find(
        (u: any) => u.id === res.Resource___created_by
      );
      const lastModifiedByUser = users.find(
        (u: any) => u.id === res.Resource___last_modified_by
      );
      return {
        Resource: {
          id: res.Resource_Id,
          Name: res.Resource_FullName,
          email: res.Resource_Email,
          UserId: res.Resource_UserId,
          location: res.Resource_WorkLocation,
          resourceStatus: res.Resource_Status,
          userStatus:
            res.User_status === null ? 'Not Created' : res.User_status,
          __created: res.Resource___created,
          __created_by: createdByUser
            ? `${createdByUser?.firstName} ${createdByUser?.lastName}`
            : '',
          __last_modified: res.Resource___last_modified,
          __last_modified_by: lastModifiedByUser
            ? `${lastModifiedByUser?.firstName} ${lastModifiedByUser?.lastName}`
            : '',
        },
      };
    });
    yield put(setUserResources(formattedResources));
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
