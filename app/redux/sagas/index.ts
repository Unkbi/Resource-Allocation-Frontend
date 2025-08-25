import { all } from 'redux-saga/effects';
import { projectsSaga } from './projectsSaga';
import teamSaga from './teamsSaga';
import { allAllocationsSaga } from './allAllocationsSaga';
import { actualAllocationsSaga } from './actualAllocationsSaga';
import { dashboardSaga } from './dashboardSaga';
import { organisationsSaga } from './organisationsSaga';
import { employeeRatesSaga } from './employeeRatesSaga';
import { AllResourcesDetailSaga } from './allResourcesDetailSaga';
import { portfolioSaga } from './portfolioSaga';
import { rbacSaga } from './rbacSaga';
import { projectTypesSaga } from './projectTypesSaga';

export default function* rootSaga() {
  yield all([
    projectsSaga(),
    teamSaga(),
    allAllocationsSaga(),
    actualAllocationsSaga(),
    dashboardSaga(),
    organisationsSaga(),
    employeeRatesSaga(),
    AllResourcesDetailSaga(),
    portfolioSaga(),
    rbacSaga(),
    projectTypesSaga(),
    // ...add more watchers here
  ]);
}
