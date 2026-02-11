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
import { RESET_STORE } from './actions/authActions';
import businessImpactReducer from './reducers/businessImpactReducer';
import aiSummaryReducer from './reducers/aiSummaryReducer';
import filterReducer from './reducers/filterReducer';
import { customReportReducer } from './reducers/customReportReducer';

const sagaMiddleware = createSagaMiddleware();

let storeInstance: ReturnType<typeof configureStore> | null = null;

export const makeStore = () => {
  const store = configureStore({
    reducer: (state: any, action: any) => {
      if (action.type === RESET_STORE) {
        state = undefined; // resets every slice to its initial state
      }
      return {
        user: userReducer(state?.user, action),
        allocationView: allocationViewReducer(state?.allocationView, action),
        teams: teamsReducer(state?.teams, action),
        projects: projectsReducer(state?.projects, action),
        resources: resourcesReducer(state?.resources, action),
        organisations: orgaisationsReducer(state?.organisations, action),
        resourceAllocations: resourceAllocationReducer(
          state?.resourceAllocations,
          action
        ),
        toast: toastSlice(state?.toast, action),
        globalDialog: dialogReducer(state?.globalDialog, action),
        dataGrid: dataGridReducer(state?.dataGrid, action),
        settings: settingsReducer(state?.settings, action),
        allAllocations: allAllocationReducer(state?.allAllocations, action),
        actualAllocations: actualAllocationReducer(
          state?.actualAllocations,
          action
        ),
        highlightedRow: highlightedRowReducer(state?.highlightedRow, action),
        allocationsCost: allocationsCostReducer(state?.allocationsCost, action),
        dashboard: dashboardReducer(state?.dashboard, action),
        employeeRates: employeeRatesReducer(state?.employeeRates, action),
        allResourcesDetail: allResourcesDetailReducer(
          state?.allResourcesDetail,
          action
        ),
        portfolios: portfolioReducer(state?.portfolios, action),
        rbac: rbacReducer(state?.rbac, action),
        allSettings: allSettingsReducer(state?.allSettings, action),
        businessImpact: businessImpactReducer(state?.businessImpact, action),
        aiSummary: aiSummaryReducer(state?.aiSummary, action),
        filters : filterReducer(state?.filters, action),
        customReport: customReportReducer(state?.customReport, action),
      };
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
