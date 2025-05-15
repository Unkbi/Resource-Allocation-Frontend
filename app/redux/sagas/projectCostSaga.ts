// src/sagas/projectCostSaga.ts
import { put, delay, takeLatest, fork, cancel, call } from 'redux-saga/effects';
import {
  setDataProcessing,
  updateProjectCosts,
} from '../reducers/projectCostReducer';
import { sagaTaskRefs } from './sagaTasks';
import { getMondayOfISO } from '@/app/utils/common';
import { formatAllocations } from '@/app/utils/allocationUtils';
import { fetchAllAllocationCosts } from '@/app/services/allocationCostServices';

function* fetchAllAllocationsSaga(action: any): Generator<any, void, any> {
  const { projects, startDate, endDate } = action.payload;

  try {
    yield put(setDataProcessing(true));

    const postData = {
      'ResourceAllocation.Core/GetAllCostForPeriod': {
        StartDate: getMondayOfISO(startDate),
        EndDate: getMondayOfISO(endDate),
      },
    };

    const responses = yield call(fetchAllAllocationCosts, postData);

    const allAllocations = formatAllocations(responses as any, projects);

    if (allAllocations.length) {
      yield put(updateProjectCosts(allAllocations));
    }
  } catch (error) {
    console.error(
      'Saga error, Failed to fetch team project/allocations : ',
      error
    );
  } finally {
    yield put(setDataProcessing(false));
  }
}

export function* projectCostSaga() {
  yield takeLatest('FETCH_PROJECT_COSTS', function* (action) {
    if (sagaTaskRefs.ongoingProjectCostTask) {
      yield cancel(sagaTaskRefs.ongoingProjectCostTask);
    }

    //@ts-ignore
    sagaTaskRefs.ongoingProjectCostTask = yield fork(
      fetchAllAllocationsSaga,
      action
    );
  });
}
