import {
  confirmActualsEnteredForPeriod,
  fetchActualAllocationsForPeriod,
  fetchActualStatusForPeriod,
} from '@/app/services/actualAllocationServices';
import { put, takeLatest } from 'redux-saga/effects';
import {
  CONFIRM_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS_STATUSES,
  GET_ACTUAL_STATUS,
} from '../actions/actualAllocationsActions';
import {
  ActualAllocationsForPeriodPayload,
  ActualStatusForPeriodPayload,
  ConfirmActualAllocationsForPeriodRequest,
} from '@/app/types';
import {
  setActualAllocations,
  setActualAllocationsStatuses,
  setActualAllocationsStatusesLoading,
  setActualsStatus,
  setActualsStatusLoading,
  setDataProcessing,
} from '../reducers/actualAllocationsReducer';

const fetchActualAllocationsForPeriodSagaFunction = function* (
  action: any
): Generator<any, void, any> {
  const { resource, startDate, endDate } = action.payload;
  yield put(setDataProcessing(true));
  try {
    const postData: ActualAllocationsForPeriodPayload = {
      Resource: resource,
      StartDate: startDate,
      EndDate: endDate,
    };
    const response = yield fetchActualAllocationsForPeriod(postData);

    yield put(setActualAllocations(response));
  } catch (error) {
    console.error('Error fetching actual allocations:', error);
  } finally {
    yield put(setDataProcessing(false));
  }
};

const fetchActualAllocationsStatusesForPeriodSagaFunction = function* (
  action: any
): Generator<any, void, any> {
  const { resource, startDate, endDate } = action.payload;
  yield put(setActualAllocationsStatusesLoading(true));
  try {
    const postData: ActualStatusForPeriodPayload = {
      Resource: resource,
      Status: null,
      StartDate: startDate,
      EndDate: endDate,
    };
    const response = yield fetchActualStatusForPeriod(postData);

    yield put(setActualAllocationsStatuses(response));
  } catch (error) {
    console.error('Error fetching Actual Statuses:', error);
  } finally {
    yield put(setActualAllocationsStatusesLoading(false));
  }
};

const fetchActualStatusForPeriodSagaFunction = function* (
  action: any
): Generator<any, void, any> {
  const { resource, status, startDate, endDate } = action.payload;
  yield put(setActualsStatusLoading(true));
  try {
    const postData: ActualStatusForPeriodPayload = {
      Resource: resource,
      Status: status,
      StartDate: startDate,
      EndDate: endDate,
    };
    const response = yield fetchActualStatusForPeriod(postData);

    yield put(setActualsStatus(response));
  } catch (error) {
    console.error('Error fetching Actual Status:', error);
  } finally {
    yield put(setActualsStatusLoading(false));
  }
};

const confirmActualAllocationsForPeriodSagaFunction = function* (
  action: any
): Generator<any, void, any> {
  const { resource, period, status, actuals, resolve, reject } = action.payload;
  try {
    const postData: ConfirmActualAllocationsForPeriodRequest = {
      Resource: resource,
      Period: period,
      Status: status,
      Actuals: actuals,
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
    GET_ACTUAL_ALLOCATIONS_STATUSES,
    fetchActualAllocationsStatusesForPeriodSagaFunction
  );
  yield takeLatest(GET_ACTUAL_STATUS, fetchActualStatusForPeriodSagaFunction);
  yield takeLatest(
    CONFIRM_ACTUAL_ALLOCATIONS,
    confirmActualAllocationsForPeriodSagaFunction
  );
}
