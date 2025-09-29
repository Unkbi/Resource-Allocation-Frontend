// store.ts
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import rootReducer from './reducers/rootReducer';

const sagaMiddleware = createSagaMiddleware();

let storeInstance: ReturnType<typeof configureStore> | null = null;

export const makeStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: true,
        serializableCheck: false,
      }).concat(sagaMiddleware),
  });
  // attaching all of our saga through rootSaga
  sagaMiddleware.run(rootSaga);

  storeInstance = store;
  return store;
};

export type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
export type AppDispatch = ReturnType<typeof makeStore>['dispatch'];
export const getStore = () => storeInstance;
