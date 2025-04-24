import { call, put, takeLatest, cancel, fork } from 'redux-saga/effects';
import { fetchAllAllocations } from '@/app/services/allocationServices';
import { getMonday } from '@/app/utils/common';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/app/constants/constants';
import { setDataProcessing } from '../reducers/allAllocationsReducer';

function* fetchAllAllocationsSaga(action: any): Generator<any, void, any> {
  const { startDate, endDate } = action.payload;

  try {
    yield put(setDataProcessing(true));

    const postData = {
      'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
        StartDate: format(getMonday(startDate), DATE_FORMAT),
        EndDate: format(getMonday(endDate), DATE_FORMAT),
      },
    };

    const responses = yield call(fetchAllAllocations, postData);
    debugger;
    // Got your response now, format the data to have a combination of teams and projects data.

    // const allAllocations = formatAllocations(responses, projects);
    // if (allAllocations.length) {
    //   yield put(updateAllocations(allAllocations));
    // }
  } catch (error) {
    console.error(
      'Saga error, Failed to fetch team project/allocations : ',
      error
    );
  } finally {
    yield put(setDataProcessing(false));
  }
}

export function* allAllocationsSaga() {
  yield takeLatest('FETCH_ALL_ALLOCATIONS', fetchAllAllocationsSaga);
}
