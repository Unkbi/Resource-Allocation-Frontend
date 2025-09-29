// rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './authReducer';
import allocationViewReducer from './allocationViewReducer';
import teamsReducer from './teamsReducer';
import projectsReducer from './projectsReducer';
import resourcesReducer from './resourcesReducer';
import orgaisationsReducer from './organisationsReducer';
import resourceAllocationReducer from './resourceAllocationReducer';
import toastSlice from './toastReducer';
import dialogReducer from './dialogReducer';
import dataGridReducer from './dataGridReducer';
import settingsReducer from './settingsReducer';
import allAllocationReducer from './allAllocationsReducer';
import actualAllocationReducer from './actualAllocationsReducer';
import allocationsCostReducer from './AllocationsCostReducer';
import highlightedRowReducer from './highlightedRowReducer';
import dashboardReducer from './dashboardReducer';
import employeeRatesReducer from './employeeRatesReducer';
import allResourcesDetailReducer from './allResourcesDetailReducer';
import portfolioReducer from './portfolioReducer';
import rbacReducer from './rbacReducer';
import allSettingsReducer from './allSettingsReducer';
import { RESET_STORE } from '../actions/authActions';

// combine everything
const appReducer = combineReducers({
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
});

// 👇 wrapper reducer that resets state
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any
) => {
  if (action.type === RESET_STORE) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
