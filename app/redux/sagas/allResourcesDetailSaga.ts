import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  FETCH_ALL_RESOURCES_DETAIL,
  FETCH_ALL_RESOURCES_DETAIL_SUCCESS,
  FETCH_RESOURCE_DETAILS,
} from '../actions/allResourcesDetailAction';
import {
  setAllResourcesDetail,
  setLoading,
} from '../reducers/allResourcesDetailReducer';
import {
  fetchAllResourcesDetail,
  fetchResourceDetails,
} from '@/app/services/allResourcesDetailServices';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { AllResourceDetail, Resource, Team } from '@/app/types';
import { Organisation } from '@/app/types/organisationTypes';
import { setResources } from '../reducers/resourcesReducer';
import { fetchAllTeams } from '../actions/fetchTeamsAction';

export interface APIResponsePreFormated {
  Resource: {
    Resource: Resource | null;
  } | null;
  Team: {
    Team: Team | null;
  } | null;
  Organization: {
    Organization: Organisation | null;
  } | null;
}

function* fetchAllResourcesDetailSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchAllResourcesDetail);

    let formatedResponse = formatAPIResponse('ResourceDetail', responses);
    formatedResponse = formatedResponse?.map(
      (item: APIResponsePreFormated) => ({
        Resource: item?.Resource?.Resource || null,
        Team: item?.Team?.Team || null,
        Organization: item?.Organization?.Organization || null,
      })
    );

    yield put(setAllResourcesDetail(formatedResponse));

    const resources = formatedResponse?.map(
      (item: AllResourceDetail) => item.Resource
    );
    yield put(setResources(resources));

    yield put({
      type: FETCH_ALL_RESOURCES_DETAIL_SUCCESS,
      payload: {
        allResourcesDetail: formatedResponse,
        resources,
      },
    });

    // Setup TeamResources
    let teams = yield select(state => state.teams.teams);
    if (!teams) {
      yield put(fetchAllTeams);
      teams = yield select(state => state.teams.teams);
    }

    yield put({
      type: 'FETCH_TEAM_RESOURCES',
      payload: { teams: teams, allResourcesDetail: formatedResponse },
    });
  } catch (error) {
    console.error('Saga error, Failed to fetch resources data : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchResourceDetailsSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const { queryParams } = action.payload;
    const responses = yield call(fetchResourceDetails, queryParams);
    let formatedResponse = formatAPIResponse('ResourceDetail', responses);
    yield put(setResources(formatedResponse));
  } catch (error) {
    console.error('Saga error, Failed to fetch resource details : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* AllResourcesDetailSaga() {
  yield takeLatest(FETCH_ALL_RESOURCES_DETAIL, fetchAllResourcesDetailSaga);
  yield takeLatest(FETCH_RESOURCE_DETAILS, fetchResourceDetailsSaga);
}
