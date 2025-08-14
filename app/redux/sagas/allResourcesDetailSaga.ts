import { call, put, takeLatest } from 'redux-saga/effects';
import { FETCH_ALL_RESOURCES_DETAIL } from '../actions/allResourcesDetailAction';
import {
  setAllResourcesDetail,
  setLoading,
} from '../reducers/allResourcesDetailReducer';
import { fetchAllResourcesDetail } from '@/app/services/allResourcesDetailServices';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { AllResourceDetail, Resource, Team } from '@/app/types';
import { Organisation } from '@/app/types/organisationTypes';
import { setResources } from '../reducers/resourcesReducer';

interface APIResponsePreFormated {
  Resource: {
    Resource: Resource | null;
  } | null;
  Team: {
    Team: Team | null;
  } | null;
  Organization: {
    Organisation: Organisation | null;
  } | null;
}

function* fetchAllResourcesDetailSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchAllResourcesDetail);

    let formatedResponse = formatAPIResponse('ResourceDetail', responses);
    formatedResponse = formatedResponse.map((item: APIResponsePreFormated) => ({
      Resource: item?.Resource?.Resource || null,
      Team: item?.Team || null,
      Organisation: item?.Organization || null,
    }));

    yield put(setAllResourcesDetail(formatedResponse));

    const resources = formatedResponse.map(
      (item: AllResourceDetail) => item.Resource
    );
    yield put(setResources(resources));
  } catch (error) {
    console.error('Saga error, Failed to fetch resources data : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* AllResourcesDetailSaga() {
  yield takeLatest(FETCH_ALL_RESOURCES_DETAIL, fetchAllResourcesDetailSaga);
}
