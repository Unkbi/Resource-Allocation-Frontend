import { call, put, takeEvery } from 'redux-saga/effects';
import { FETCH_ORGANISATIONS } from '../actions/organizationsAction';
import {
  setLoading,
  setOrganisations,
} from '../reducers/oraganisationsReducer';
import { fetchAllOrganisations } from '@/app/services/organisationServices';

function* fetchOrganisationsSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchAllOrganisations);

    yield put(setOrganisations(responses?.result));
  } catch (error) {
    console.error('Saga error, Failed to fetch organisations : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* organisationsSaga() {
  yield takeEvery(FETCH_ORGANISATIONS, fetchOrganisationsSaga);
}
