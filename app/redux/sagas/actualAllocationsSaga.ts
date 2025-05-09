import {
  confirmActualsEnteredForPeriod,
  fetchActualAllocationsForPeriod,
} from '@/app/services/actualAllocationServices';
import { put, takeLatest } from 'redux-saga/effects';
import {
  CONFIRM_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS,
} from '../actions/actualAllocationsActions';
import {
  ActualAllocationsForPeriodPayload,
  ConfirmActualAllocationsForPeriodRequest,
} from '@/app/types';
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

const confirmActualAllocationsForPeriodSagaFunction = function* (
  action: any
): Generator<any, void, any> {
  const { resource, period, status, actuals, resolve, reject } = action.payload;
  try {
    const postData: ConfirmActualAllocationsForPeriodRequest = {
      'ResourceAllocation.Core/ConfirmActualsEntered': {
        Resource: resource,
        Period: period,
        Status: status,
        Actuals: actuals,
      },
    };
    const response = yield confirmActualsEnteredForPeriod(postData);
    // Notify if async operation is completed
    if (resolve) resolve(response);
  } catch (error) {
    console.error('Error confirming actual allocations:', error);
    // Notify if async operation is failed
    if (reject) reject(error);
  }
};

export function* actualAllocationsSaga() {
  yield takeLatest(
    GET_ACTUAL_ALLOCATIONS,
    fetchActualAllocationsForPeriodSagaFunction
  );
  yield takeLatest(
    CONFIRM_ACTUAL_ALLOCATIONS,
    confirmActualAllocationsForPeriodSagaFunction
  );
}
