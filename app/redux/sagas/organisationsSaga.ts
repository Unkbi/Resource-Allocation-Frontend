import { all, call, put, takeEvery,takeLatest } from 'redux-saga/effects';
import {
 CREATE_ORGANISATION,
 DELETE_ORGANISATION,
 FETCH_ORGANISATIONS,
 UPDATE_ORGANISATION,
} from '../actions/organizationsAction';
import {
 setLoading,
 setOrganisations,
} from '../reducers/oraganisationsReducer';
import {
 fetchAllOrganisations,
 createOrganisation,
 updateOrganisation,
 deleteOrganisation,
} from '@/app/services/organisationServices';

// loading all orgs
function* fetchOrganisationsSaga(): Generator<any, void, any> {
 try {
  // setting the loading in reducer
   yield put(setLoading(true));
   const responses = yield call(fetchAllOrganisations);
   yield put(setOrganisations(responses?.result));
 } catch (error) {
   console.error('Saga error, Failed to fetch organisations : ', error);
 } finally {
   yield put(setLoading(false));
 }
}

function* createOrganisationSaga(action: any): Generator<any, void, any> {
  // deconstructed action object
  const { postData, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    // API post 
    const response = yield call(createOrganisation, postData);
    yield call(fetchOrganisationsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to create Organisation : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}


function* updateOrganisationSaga(action: any): Generator<any, void, any> {
  // deconstructed action
  const { id, updatedFields, resolve, reject } = action.payload;
  try {
    yield put(setLoading(true));
    // parts passed into undate function
    const response = yield call(updateOrganisation, id, updatedFields);
    yield call(fetchOrganisationsSaga);
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Saga error, Failed to update Organisation : ', error);
    if (reject) reject(error);
  } finally {
    yield put(setLoading(false));
  }
}

function* deleteOrganisationSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));
    const {id} = action.payload;
    yield call(deleteOrganisation, id);
    yield call(fetchOrganisationsSaga);
  } catch (error) {
    console.error('Saga error, Failed to delete Organisation : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* organizationsSaga() {
 yield takeEvery(FETCH_ORGANISATIONS, fetchOrganisationsSaga);
 yield takeEvery(CREATE_ORGANISATION, createOrganisationSaga)
 yield takeEvery(UPDATE_ORGANISATION, updateOrganisationSaga)
 yield takeEvery(DELETE_ORGANISATION, deleteOrganisationSaga)
}

