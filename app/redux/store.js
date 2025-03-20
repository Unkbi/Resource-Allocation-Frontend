import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/authReducer';
import allocationViewReducer from '../redux/reducers/allocationViewReducer';
import teamsReducer from './reducers/teamsReducer';
import projectsReducer from './reducers/projectsReducer';
import resourcesReducer from './reducers/resourcesReducer';
import resourceAllocationReducer from './reducers/resourceAllocationReducer';
import toastSlice from './reducers/toastReducer';
import dialogReducer from './reducers/dialogReducer';

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
    },
  });
};
