// src/sagas/projectCostSaga.ts
import { put, delay, takeLatest, fork, cancel, call } from 'redux-saga/effects';
import { setDataProcessing, updateProjectCosts } from '../reducers/projectCostReducer';
import { mockAllocationData } from '@/app/constants/mockAllocations';
import { sagaTaskRefs } from './sagaTasks';
import { getMondayOfISO } from '@/app/utils/common';
import { formatAllocations } from '@/app/utils/allocationUtils';
// import {
//   setDataProcessing,
// } from '../reducers/projectsReducer';

// function* fetchProjectCostsSaga(action: any): Generator<any, void, any> {
//   try {
//     yield put(setDataProcessing(true));
//     yield delay(1000); // simulate API delay
//     yield put(updateProjectCosts(mockAllocationData));
//   } catch (error) {
//     console.error('Saga error, failed to fetch mock project costs:', error);
//   } finally {
//     yield put(setDataProcessing(false));
//   }
// }

function* fetchAllAllocationsSaga(action: any): Generator<any, void, any> {
  const { projects, startDate, endDate } = action.payload;

  try {
    yield put(setDataProcessing(true));

    // const postData = {
    //   'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
    //     StartDate: getMondayOfISO(startDate),
    //     EndDate: getMondayOfISO(endDate),
    //   },
    // };

    // const responses = yield call(fetchAllAllocations, postData);
    const responses = mockAllocationData;
    // console.log("responses =", responses)

    const allAllocations = formatAllocations(responses as any, projects);
    // console.log("allAllocations=", allAllocations)
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
