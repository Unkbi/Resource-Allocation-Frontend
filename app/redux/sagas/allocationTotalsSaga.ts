import { call, put, takeLatest } from 'redux-saga/effects';
import {
  setLoading,
  setTotalAllocationCosts,
  setTotalAllocations,
  setTotalAllocationsTillDate,
  setTotalAllocationSummary,
} from '../reducers/allocationTotalsReducer';
import {
  fetchTotalAllocationCosts,
  fetchTotalAllocations,
  fetchTotalAllocationsSummary,
} from '@/app/services/allocationTotalsServices';
import {
  FETCH_TOTAL_ALLOCATION_COST,
  FETCH_TOTAL_ALLOCATIONS,
  FETCH_TOTAL_ALLOCATIONS_SUMMARY,
  FETCH_TOTAL_ALLOCATIONS_TILL_DATE,
  UPDATE_TOTAL_ALLOCATIONS,
} from '../actions/allocationTotalsAction';
import { PROJECT_ALLOCATION_STATUS } from '@/app/constants/constants';
import { getMondayOfISO } from '@/app/utils/common';
import { TotalAllocationResponse } from '@/app/types/allocationTotalsTypes';

function* fetchTotalAllocationsSaga(action: any): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const response = yield call(fetchTotalAllocations, action.payload);

    yield put(setTotalAllocations(response));
  } catch (error) {
    console.error('Saga error:', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchTotalAllocationTillDateSaga(): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const payload = {
      EndDate: getMondayOfISO(new Date().toISOString()),
      Status: PROJECT_ALLOCATION_STATUS,
    };

    const response = yield call(fetchTotalAllocations, payload);

    yield put(setTotalAllocationsTillDate(response));
  } catch (error) {
    console.error('Saga error:', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchTotalAllocationCostsSaga(
  action: any
): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const response = yield call(fetchTotalAllocationCosts, action.payload);

    yield put(setTotalAllocationCosts(response));
  } catch (error) {
    console.error('Saga error:', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* fetchTotalAllocationsSummarySaga(
  action: any
): Generator<any, void, any> {
  try {
    yield put(setLoading(true));

    const response = yield call(fetchTotalAllocationsSummary, action.payload);

    yield put(setTotalAllocationSummary(response));
  } catch (error) {
    console.error('Saga error:', error);
  } finally {
    yield put(setLoading(false));
  }
}

function* updateTotalAllocationsSaga(action: any): Generator<any, void, any> {
  const { updatedProjects, resolve, reject } = action.payload;
  try {
    const payload = {
      Project: updatedProjects,
    };

    const responseTotalAllocation: TotalAllocationResponse = yield call(
      fetchTotalAllocations,
      payload
    );

    const responseTotalAllocationTillDate: TotalAllocationResponse = yield call(
      fetchTotalAllocations,
      {
        ...payload,
        EndDate: getMondayOfISO(new Date().toISOString()),
      }
    );

    resolve({
      totalAllocation: responseTotalAllocation,
      totalAllocationTillDate: responseTotalAllocationTillDate,
    });
  } catch (error) {
    console.error('Saga error While Updating Total Allocations:', error);
    reject(error);
  }
}

export function* AllocationTotalsSaga() {
  yield takeLatest(FETCH_TOTAL_ALLOCATIONS, fetchTotalAllocationsSaga);
  yield takeLatest(FETCH_TOTAL_ALLOCATION_COST, fetchTotalAllocationCostsSaga);
  yield takeLatest(
    FETCH_TOTAL_ALLOCATIONS_SUMMARY,
    fetchTotalAllocationsSummarySaga
  );
  yield takeLatest(
    FETCH_TOTAL_ALLOCATIONS_TILL_DATE,
    fetchTotalAllocationTillDateSaga
  );
  yield takeLatest(UPDATE_TOTAL_ALLOCATIONS, updateTotalAllocationsSaga);
}
