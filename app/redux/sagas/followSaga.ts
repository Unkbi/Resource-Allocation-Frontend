import { call, put, takeLatest } from 'redux-saga/effects';
import { followService } from '@/app/services/followServices';
import {
  FETCH_FOLLOWS,
  CREATE_FOLLOW,
  UPDATE_FOLLOW_PREFERENCES,
  UNFOLLOW,
  fetchFollowsSuccess,
  fetchFollowsFailure,
  createFollowSuccess,
  createFollowFailure,
  updateFollowPreferencesSuccess,
  updateFollowPreferencesFailure,
  unfollowSuccess,
  unfollowFailure,
} from '../actions/followActions';

// Fetch all follows for a user
function* fetchFollowsSaga(action: any): Generator<any, void, any> {
  try {
    const response = yield call(followService.getFollows, action.payload);
    yield put(fetchFollowsSuccess(response));
  } catch (error: any) {
    yield put(
      fetchFollowsFailure(
        error?.response?.data?.message || 'Failed to fetch follows'
      )
    );
  }
}

// Create a new follow
function* createFollowSaga(action: any): Generator<any, void, any> {
  const { payload, resolve, reject } = action.payload;
  try {
    const response = yield call(followService.createFollow, payload);
    
    // Extract the Follow object from response
    const followData = response?.Follow || response;
    
    yield put(createFollowSuccess(followData));
    if (resolve) resolve(followData);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || 'Failed to follow';
    yield put(createFollowFailure(errorMessage));
    if (reject) reject(error);
  }
}

// Update follow preferences
function* updateFollowPreferencesSaga(action: any): Generator<any, void, any> {
  const { payload, resolve, reject } = action.payload;
  try {
    const response = yield call(followService.updateFollowPreferences, payload);
    
    // Extract the Follow object from response
    const followData = response?.Follow || response;
    
    yield put(updateFollowPreferencesSuccess(followData));
    if (resolve) resolve(followData);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || 'Failed to update follow preferences';
    yield put(updateFollowPreferencesFailure(errorMessage));
    if (reject) reject(error);
  }
}

// Unfollow
function* unfollowSaga(action: any): Generator<any, void, any> {
  const { payload, resolve, reject } = action.payload;
  try {
    const response = yield call(followService.unfollow, payload);
    yield put(unfollowSuccess(payload.FollowId));
    if (resolve) resolve(response);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || 'Failed to unfollow';
    yield put(unfollowFailure(errorMessage));
    if (reject) reject(error);
  }
}

// Root saga watcher
export function* followSaga() {
  yield takeLatest(FETCH_FOLLOWS, fetchFollowsSaga);
  yield takeLatest(CREATE_FOLLOW, createFollowSaga);
  yield takeLatest(UPDATE_FOLLOW_PREFERENCES, updateFollowPreferencesSaga);
  yield takeLatest(UNFOLLOW, unfollowSaga);
}
