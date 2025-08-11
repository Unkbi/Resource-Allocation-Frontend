import { all, call, put, takeEvery,takeLatest } from 'redux-saga/effects';
import {
 CREATE_ORGANISATION,
 DELETE_ORGANISATION,
 FETCH_ORGANISATIONS,
 UPDATE_ORGANISATION,
//  FETCH_ORGANISATIONS_RESOURCES,
} from '../actions/organizationsAction';
import {
 setAllOrganisationsResources,
 setLoading,
 setOrganisations,
} from '../reducers/organisationsReducer';
import {
 fetchAllOrganisations,
 createOrganisation,
 updateOrganisation,
 deleteOrganisation,
 // fetchResourcesAgainstOrganizationsForSaga,
 // updateOrganizationForResourceSaga,
} from '@/app/services/organisationServices';
import { Organisation } from '@/app/types/organisationTypes';
import { Resource } from '@/app/types';
import { ResourceOrganizationPayload } from '@/app/types/organisationTypes';

// loading all orgs
function* fetchOrganisationsSaga(): Generator<any, void, any> {
 try {
  // setting the loading in reducer
   yield put(setLoading(true));
   const responses = yield call(fetchAllOrganisations);
   console.log(responses.result)
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
    console.log('Creating org with:', postData)
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

