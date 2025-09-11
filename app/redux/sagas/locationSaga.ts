import { call, put, takeEvery } from 'redux-saga/effects';
import {
  setLoading,
  setLocation,
  setLocationGroup,
} from '../reducers/allSettingsReducer';
import {
  addLocation,
  fetchLocation,
  deleteLocation,
  updateLocation,
  fetchLocationGroups,
  addLocationGroups,
  updateLocationGroups,
  deleteLocationGroups,
} from '../../services/locationServices';
import {
  ADD_LOCATION,
  DELETE_LOCATION,
  FETCH_LOCATION,
  UPDATE_LOCATION,
  FETCH_LOCATION_GROUPS,
  ADD_LOCATION_GROUPS,
  UPDATE_LOCATION_GROUPS,
  DELETE_LOCATION_GROUPS,
} from '../actions/allSettingsActions';

function* fetchLocationSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchLocation);

    yield put(setLocation(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch Locations : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createLocationSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(addLocation, postData);

    yield call(fetchLocationSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Location : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateLocationSaga(action: any): Generator<any, void, any> {
  const { postData, locationId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(updateLocation, postData, locationId);

    yield call(fetchLocationSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Location : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteLocationSaga(action: any): Generator<any, void, any> {
  const { locationId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(deleteLocation, locationId);
    yield call(fetchLocationSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to delete Location : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchLocationGroupSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchLocationGroups);

    yield put(setLocationGroup(responses));
  } catch (error) {
    console.error('Saga error, Failed to fetch LocationGroups : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* createLocationGroupSaga(action: any): Generator<any, void, any> {
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(addLocationGroups, postData);

    yield call(fetchLocationGroupSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Location Group : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateLocationGroupSaga(action: any): Generator<any, void, any> {
  const { postData, locationGroupId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(
      updateLocationGroups,
      postData,
      locationGroupId
    );

    yield call(fetchLocationGroupSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Location Group : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteLocationGroupSaga(action: any): Generator<any, void, any> {
  const { locationGroupId, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    const response = yield call(deleteLocationGroups, locationGroupId);
    yield call(fetchLocationGroupSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to delete Location Group : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* locationGroupsSaga() {
  yield takeEvery(FETCH_LOCATION_GROUPS, fetchLocationGroupSaga);
  yield takeEvery(ADD_LOCATION_GROUPS, createLocationGroupSaga);
  yield takeEvery(UPDATE_LOCATION_GROUPS, updateLocationGroupSaga);
  yield takeEvery(DELETE_LOCATION_GROUPS, deleteLocationGroupSaga);
  yield takeEvery(ADD_LOCATION, createLocationSaga);
  yield takeEvery(FETCH_LOCATION, fetchLocationSaga);
  yield takeEvery(UPDATE_LOCATION, updateLocationSaga);
  yield takeEvery(DELETE_LOCATION, deleteLocationSaga);
}
