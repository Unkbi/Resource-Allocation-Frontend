import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/authReducer';
import allocationViewReducer from './reducers/allocationViewReducer';
import teamsReducer from './reducers/teamsReducer';
import projectsReducer from './reducers/projectsReducer';
import resourcesReducer from './reducers/resourcesReducer';
import resourceAllocationReducer from './reducers/resourceAllocationReducer';
import toastSlice from './reducers/toastReducer';
import dialogReducer from './reducers/dialogReducer';
import dataGridReducer from './reducers/dataGridReducer';

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      allocationView: allocationViewReducer,
      teams: teamsReducer,
      projects: projectsReducer,
      resources: resourcesReducer,
      resourceAllocations: resourceAllocationReducer,
      toast: toastSlice,
      globalDialog: dialogReducer,
      dataGrid: dataGridReducer,
    },
  });
};

export type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
export type AppDispatch = ReturnType<typeof makeStore>['dispatch'];
