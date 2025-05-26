import { all } from 'redux-saga/effects';
import { projectsSaga } from './projectsSaga';
import teamSaga from './teamsSaga';
import { allAllocationsSaga } from './allAllocationsSaga';
import { actualAllocationsSaga } from './actualAllocationsSaga';
import { dashboardSaga } from './dashboardSaga';

export default function* rootSaga() {
  yield all([
    projectsSaga(),
    teamSaga(),
    allAllocationsSaga(),
    actualAllocationsSaga(),
    dashboardSaga(),
    // ...add more watchers here
  ]);
}
