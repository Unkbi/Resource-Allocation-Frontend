import { all } from 'redux-saga/effects';
import { projectsSaga } from './projectsSaga';
import teamSaga from './teamsSaga';
import { allAllocationsSaga } from './allAllocationsSaga';
import { actualAllocationsSaga } from './actualAllocationsSaga';
import { dashboardSaga } from './dashboardSaga';
import { organizationsSaga } from './organisationsSaga';
import { employeeRatesSaga } from './employeeRatesSaga';
import { AllResourcesDetailSaga } from './allResourcesDetailSaga';
import { portfolioSaga } from './portfolioSaga';
import { rbacSaga } from './rbacSaga';
import { projectTypesSaga } from './projectTypesSaga';
import { allSettingsSaga } from './allSettingsSaga';

// listening for all sagas based on actions
export default function* rootSaga() {
  yield all([
    projectsSaga(),
    teamSaga(),
    allAllocationsSaga(),
    actualAllocationsSaga(),
    dashboardSaga(),
    organizationsSaga(),
    employeeRatesSaga(),
    AllResourcesDetailSaga(),
    portfolioSaga(),
    rbacSaga(),
    projectTypesSaga(),
    allSettingsSaga(),
    // ...add more watchers here
  ]);
}
