import { call, put, takeLatest, cancel, fork } from 'redux-saga/effects';
import {
  setDataProcessing,
  updateAllocations,
} from '../reducers/projectsReducer';
import { formatAllocations } from '@/app/utils/allocationUtils';
import { fetchAllAllocations } from '@/app/services/allocationServices';
import { sagaTaskRefs } from './sagaTasks';
import {getMondayOfISO } from '@/app/utils/common';

function* fetchAllAllocationsSaga(action: any): Generator<any, void, any> {
  const { projects, startDate, endDate } = action.payload;

  try {
    yield put(setDataProcessing(true));

    const postData = {
      'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
         StartDate: getMondayOfISO(startDate),
         EndDate: getMondayOfISO(endDate),
      },
    };

    const responses = yield call(fetchAllAllocations, postData);

    const allAllocations = formatAllocations(responses, projects);
    if (allAllocations.length) {
      yield put(updateAllocations(allAllocations));
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

export function* projectsSaga() {
  yield takeLatest('FETCH_ALL_ALLOCATIONS', function* (action) {
    // Cancel teams task if active
    if (sagaTaskRefs.ongoingTeamsTask) {
      yield cancel(sagaTaskRefs.ongoingTeamsTask);
    }

    if (sagaTaskRefs.ongoingProjectTask) {
      yield cancel(sagaTaskRefs.ongoingProjectTask);
    }

    //@ts-ignore
    sagaTaskRefs.ongoingProjectTask = yield fork(
      fetchAllAllocationsSaga,
      action
    );
  });
}
