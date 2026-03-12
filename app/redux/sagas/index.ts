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
import { locationSaga } from './locationSaga';
import { userManagementSaga } from './userManagementSaga';
import { businessImpactSaga } from './businessImpactSaga';
import { bootstrapSaga } from './initBootstrapSaga';
import { aiSummarySaga } from './aiSummarySaga';
import savedReportsSaga from './savedReportsSaga';
import { customReportSaga } from './customReportSaga';
import { userPreferencesSaga } from './userPreferencesSaga';
import { followSaga } from './followSaga';
import { AllocationTotalsSaga } from './allocationTotalsSaga';

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
    locationSaga(),
    userManagementSaga(),
    businessImpactSaga(),
    bootstrapSaga(),
    aiSummarySaga(),
    savedReportsSaga(),
    customReportSaga(),
    userPreferencesSaga(),
    followSaga(),
    AllocationTotalsSaga(),
    // ...add more watchers here
  ]);
}
