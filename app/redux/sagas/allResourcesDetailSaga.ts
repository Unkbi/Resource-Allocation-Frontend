import { call, put, takeEvery } from 'redux-saga/effects';
import { FETCH_ALL_RESOURCES_DETAIL } from '../actions/allResourcesDetailAction';
import {
  setAllResourcesDetail,
  setLoading,
} from '../reducers/allResourcesDetailReducer';
import { fetchAllResourcesDetail } from '@/app/services/allResourcesDetailServices';

function* fetchAllResourcesDetailSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const responses = yield call(fetchAllResourcesDetail);

    yield put(setAllResourcesDetail(responses?.result));
  } catch (error) {
    console.error('Saga error, Failed to fetch resources data : ', error);
  } finally {
    yield put(setLoading(false));
  }
}

export function* AllResourcesDetailSaga() {
  yield takeEvery(FETCH_ALL_RESOURCES_DETAIL, fetchAllResourcesDetailSaga);
}
