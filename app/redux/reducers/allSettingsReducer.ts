import { ScalarSettings } from '@/app/types';
import {
  AllSettings,
  ScalarSettingsArrayElement,
} from '@/app/types/allSettingsType';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState: AllSettings = {
  allocationTheme: [],
  projectTypes: [],
  projectTypeGroups: [],
  scalarSettings: null,
  loading: false,
  error: null,
};

const allSettingsSlice = createSlice({
  name: 'allSettings',
  initialState,
  reducers: {
    setAllSettings: (state, action) => {
      state.projectTypes = formatAPIResponse(
        'ProjectType',
        action.payload.ProjectType || []
      );
      state.projectTypeGroups = formatAPIResponse(
        'ProjectTypeGroup',
        action.payload.ProjectTypeGroup || []
      );

      const scalarSettingArr = formatAPIResponse(
        'ScalarSetting',
        action.payload.ScalarSettings || []
      ) as ScalarSettingsArrayElement[];
      state.scalarSettings = scalarSettingArr.reduce((acc, setting) => {
        acc[setting.SettingKey] = setting.SettingValue;
        return acc;
      }, {} as ScalarSettings);
    },
    setProjectTypes: (state, action) => {
      state.projectTypes = formatAPIResponse('ProjectType', action.payload);
    },
    clearProjectTypes: state => {
      state.projectTypes = [];
    },
    updateProjectType: (state, action) => {
      const updatedProjectType = action.payload;
      if (!state.projectTypes) return;
      const index = state.projectTypes.findIndex(
        projectType => projectType.Id === updatedProjectType.Id
      );
      if (index !== -1) {
        state.projectTypes[index] = {
          ...state.projectTypes[index],
          ...updatedProjectType,
        };
      }
    },
    setProjectTypeGroups: (state, action) => {
      state.projectTypeGroups = formatAPIResponse(
        'ProjectTypeGroup',
        action.payload
      );
    },
    clearProjectTypeGroups: state => {
      state.projectTypeGroups = [];
    },
    updateProjectTypeGroup: (state, action) => {
      const updatedProjectTypeGroup = action.payload;
      if (!state.projectTypeGroups) return;
      const index = state.projectTypeGroups.findIndex(
        projectTypeGroup => projectTypeGroup.Id === updatedProjectTypeGroup.Id
      );
      if (index !== -1) {
        state.projectTypeGroups[index] = {
          ...state.projectTypeGroups[index],
          ...updatedProjectTypeGroup,
        };
      }
    },
    setScalarSettings: (state, action) => {
      const newSettings = formatAPIResponse(
        'ScalarSetting',
        action.payload
      ) as ScalarSettingsArrayElement[];
      if (!state.scalarSettings) {
        state.scalarSettings = {};
      }
      newSettings.forEach(
        (setting: {
          SettingKey: string;
          SettingValue: string | number | boolean;
        }) => {
          state.scalarSettings![setting.SettingKey] = setting.SettingValue;
        }
      );
    },
    clearScalarSettings: state => {
      state.scalarSettings = null;
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
  setAllSettings,
  setProjectTypes,
  clearProjectTypes,
  updateProjectType,
  setProjectTypeGroups,
  clearProjectTypeGroups,
  updateProjectTypeGroup,
  setScalarSettings,
  clearScalarSettings,
  setLoading,
  setError,
} = allSettingsSlice.actions;
export default allSettingsSlice.reducer;
