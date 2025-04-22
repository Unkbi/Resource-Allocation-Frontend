import { call, put, all, takeLatest } from 'redux-saga/effects';
import {
  setDataProcessing,
  updateAllocations,
} from '../reducers/projectsReducer';
import { formatAllocations } from '@/app/utils/allocationUtils';
import { fetchAllAllocations } from '@/app/services/allocationServices';

function* fetchAllAllocationsSaga(action: any): Generator<any, void, any> {
  const { projects, startDate, endDate } = action.payload;

  try {
    yield put(setDataProcessing(true));

    const postData = {
      'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
        StartDate: startDate,
        EndDate: endDate,
      },
    };

    const responses = yield call(fetchAllAllocations, postData);

    const allAllocations = formatAllocations(responses, projects);
    if (allAllocations.length) {
      yield put(updateAllocations(allAllocations));
    }
  } catch (error) {
    console.error('Saga error:', error);
  } finally {
    yield put(setDataProcessing(false));
  }
}

export function* watchAllAllocations() {
  yield takeLatest('FETCH_ALL_ALLOCATIONS', fetchAllAllocationsSaga);
}
