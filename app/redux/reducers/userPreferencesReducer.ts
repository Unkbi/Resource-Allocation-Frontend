import { HOURS } from '@/app/constants/constants';
import {
  ScalarSettings,
  UserPreferences,
  UserPreferencesArrayElement,
} from '@/app/types';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState: UserPreferences = {
  userPreferences: null,
  actualsDisplayType: HOURS,
  loading: false,
  error: null,
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setUserPreferences: (state, action) => {
      const userPreferencesArr = formatAPIResponse(
        'UserPreferences',
        action.payload || []
      ) as UserPreferencesArrayElement[];
      state.userPreferences = userPreferencesArr.reduce((acc, setting) => {
        acc[setting.Key] = setting.Value;
        return acc;
      }, {} as ScalarSettings);
    },
    setActualsDisplayType: (state, action) => {
      state.actualsDisplayType = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUserPreferences,
  setActualsDisplayType,
  setLoading,
  setError,
} = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
