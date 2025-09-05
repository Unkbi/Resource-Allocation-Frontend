import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/authReducer';
import allocationViewReducer from './reducers/allocationViewReducer';
import teamsReducer from './reducers/teamsReducer';
import projectsReducer from './reducers/projectsReducer';
import resourcesReducer from './reducers/resourcesReducer';
import orgaisationsReducer from './reducers/organisationsReducer';
import resourceAllocationReducer from './reducers/resourceAllocationReducer';
import toastSlice from './reducers/toastReducer';
import dialogReducer from './reducers/dialogReducer';
import dataGridReducer from './reducers/dataGridReducer';
import settingsReducer from './reducers/settingsReducer';
import allAllocationReducer from './reducers/allAllocationsReducer';
import actualAllocationReducer from './reducers/actualAllocationsReducer';
import allocationsCostReducer from './reducers/AllocationsCostReducer';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import highlightedRowReducer from './reducers/highlightedRowReducer';
import dashboardReducer from './reducers/dashboardReducer';
import employeeRatesReducer from './reducers/employeeRatesReducer';
import allResourcesDetailReducer from './reducers/allResourcesDetailReducer';
import portfolioReducer from './reducers/portfolioReducer';
import rbacReducer from './reducers/rbacReducer';
import allSettingsReducer from './reducers/allSettingsReducer';

const sagaMiddleware = createSagaMiddleware();

let storeInstance: ReturnType<typeof configureStore> | null = null;

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      user: userReducer,
      allocationView: allocationViewReducer,
      teams: teamsReducer,
      projects: projectsReducer,
      resources: resourcesReducer,
      organisations: orgaisationsReducer,
      resourceAllocations: resourceAllocationReducer,
      toast: toastSlice,
      globalDialog: dialogReducer,
      dataGrid: dataGridReducer,
      settings: settingsReducer,
      allAllocations: allAllocationReducer,
      actualAllocations: actualAllocationReducer,
      highlightedRow: highlightedRowReducer,
      allocationsCost: allocationsCostReducer,
      dashboard: dashboardReducer,
      employeeRates: employeeRatesReducer,
      allResourcesDetail: allResourcesDetailReducer,
      portfolios: portfolioReducer,
      rbac: rbacReducer,
      allSettings: allSettingsReducer,
    },
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
