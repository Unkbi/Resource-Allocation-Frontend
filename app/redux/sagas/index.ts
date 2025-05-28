import { all } from 'redux-saga/effects';
import { projectsSaga } from './projectsSaga';
import teamSaga from './teamsSaga';
import { allAllocationsSaga } from './allAllocationsSaga';
import { actualAllocationsSaga } from './actualAllocationsSaga';
import { organisationsSaga } from './organisationsSaga';
import { employeeRatesSaga } from './employeeRatesSaga';
import { AllResourcesDetailSaga } from './allResourcesDetailSaga';

export default function* rootSaga() {
  yield all([
    projectsSaga(),
    teamSaga(),
    allAllocationsSaga(),
    actualAllocationsSaga(),
    organisationsSaga(),
    employeeRatesSaga(),
    AllResourcesDetailSaga(),
    // ...add more watchers here
  ]);
}
