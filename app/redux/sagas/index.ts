import { all } from 'redux-saga/effects';
import { projectsSaga } from './projectsSaga';
import teamSaga from './teamsSaga';

export default function* rootSaga() {
  yield all([
    projectsSaga(),
    teamSaga(),
    // ...add more watchers here
  ]);
}
