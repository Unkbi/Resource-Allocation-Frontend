import { all } from 'redux-saga/effects';
import { watchAllAllocations } from './allocationSaga';

export default function* rootSaga() {
  yield all([
    watchAllAllocations(),
    // ...add more watchers here
  ]);
}
