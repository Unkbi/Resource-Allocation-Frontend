import { all, call, put, takeEvery } from 'redux-saga/effects';
import {
  FETCH_ORGANISATIONS,
  FETCH_ORGANISATIONS_RESOURCES,
} from '../actions/organizationsAction';
import {
  setAllOrganisationsResources,
  setLoading,
  setOrganisations,
} from '../reducers/oraganisationsReducer';
import {
  fetchAllOrganisations,
  fetchResourcesAgainstOrganisationsForSaga,
} from '@/app/services/organisationServices';
import { Organisation } from '@/app/types/organisationTypes';
import { Resource } from '@/app/types';

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

function* fetchOrganisationResourcesSaga(
  action: any
): Generator<any, void, any> {
  const { organisations } = action.payload;
  try {
    yield put(setLoading(true));

    let allOrganisations: Organisation[] = organisations;
    if (!organisations || organisations.length === 0) {
      const response = yield call(fetchAllOrganisations);
      yield put(setOrganisations(response?.result));

      allOrganisations = response?.result;
    }

    const organisationResults = yield all(
      allOrganisations.map((organisation: any) =>
        call(function* () {
          const resourcesPostData = {
            'ResourceAllocation.Core/GetOrganizationResources': {
              OrganizationId: organisation.Id,
            },
          };
          //@ts-ignore
          const resourcesResult = yield call(
            fetchResourcesAgainstOrganisationsForSaga,
            resourcesPostData
          );

          return { resourcesResult, organisation };
        })
      )
    );

    let organisationResourceObject: Record<string, Resource[]> = {};
    const formatedOrganisationResults = organisationResults
      // @ts-ignore
      ?.map(organisationResult => ({
        id: organisationResult?.organisation?.Id,
        resource: organisationResult?.resourcesResult?.result,
      }));

    formatedOrganisationResults.forEach(
      (payload: { id: string; resource: Resource[] }) => {
        organisationResourceObject = organisationResourceObject || {};
        organisationResourceObject[payload.id] = payload.resource;
      }
    );

    if (organisationResults) {
      yield put(setAllOrganisationsResources(formatedOrganisationResults));
    }
  } catch (err) {
    console.error('Saga: Failed to fetch organisations resources', err);
  } finally {
    yield put(setLoading(false));
  }
}

export function* organisationsSaga() {
  yield takeEvery(FETCH_ORGANISATIONS, fetchOrganisationsSaga);
  yield takeEvery(
    FETCH_ORGANISATIONS_RESOURCES,
    fetchOrganisationResourcesSaga
  );
}
