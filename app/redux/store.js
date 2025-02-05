import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/authReducer';
import allocationViewReducer from '../redux/reducers/allocationViewReducer';
import teamsReducer from './reducers/teamsReducer';
import projectsReducer from './reducers/projectsReducer';

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      allocationView: allocationViewReducer,
      teams: teamsReducer,
      projects: projectsReducer,
    },
  });
};
