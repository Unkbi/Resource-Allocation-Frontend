import { fetchActualAllocationsForPeriod } from '@/app/services/actualAllocationServices';
import { put, takeLatest } from 'redux-saga/effects';
import { GET_ACTUAL_ALLOCATIONS } from '../actions/actualAllocationsActions';
import { ActualAllocationsForPeriodPayload } from '@/app/types';
import {
  setActualAllocations,
  setDataProcessing,
} from '../reducers/actualAllocationsReducer';

const fetchActualAllocationsForPeriodSagaFunction = function* (
  action: any
): Generator<any, void, any> {
  const { resource, startDate, endDate } = action.payload;
  yield put(setDataProcessing(true));
  try {
    const postData: ActualAllocationsForPeriodPayload = {
      'ResourceAllocation.Core/GetActualizedAllocationsByPeriod': {
        Resource: resource,
        StartDate: startDate,
        EndDate: endDate,
      },
    };
    const response = yield fetchActualAllocationsForPeriod(postData);

    yield put(setActualAllocations(response.result));
  } catch (error) {
    console.error('Error fetching actual allocations:', error);
  } finally {
    yield put(setDataProcessing(false));
  }
};

export function* actualAllocationsSaga() {
  yield takeLatest(
    GET_ACTUAL_ALLOCATIONS,
    fetchActualAllocationsForPeriodSagaFunction
  );
}
