import { all } from 'redux-saga/effects';
import { projectsSaga } from './projectsSaga';
import teamSaga from './teamsSaga';
import { allAllocationsSaga } from './allAllocationsSaga';
import { actualAllocationsSaga } from './actualAllocationsSaga';

export default function* rootSaga() {
  yield all([
    projectsSaga(),
    teamSaga(),
    allAllocationsSaga(),
    actualAllocationsSaga(),
    // ...add more watchers here
  ]);
}
