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
  location: [],
  locationGroups: [],
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
      state.location = formatAPIResponse(
        'WorkLocation',
        action.payload.WorkLocations || []
      );
      state.locationGroups = formatAPIResponse(
        'WorkLocationGroup',
        action.payload.WorkLocationGroup || []
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
    setLocation: (state, action) => {
      state.location = formatAPIResponse('WorkLocation', action.payload);
    },
    clearLocation: state => {
      state.location = [];
    },
    updateLocation: (state, action) => {
      const updatedLocation = action.payload;
      if (!state.location) return;
      const index = state.location.findIndex(
        location => location.Id === updatedLocation.Id
      );
      if (index !== -1) {
        state.location[index] = {
          ...state.location[index],
          ...updatedLocation,
        };
      }
    },
    setLocationGroup: (state, action) => {
      state.locationGroups = formatAPIResponse(
        'WorkLocationGroup',
        action.payload
      );
    },
    clearLocationGroups: state => {
      state.locationGroups = [];
    },
    updateLocationGroup: (state, action) => {
      const updatedLocationGroup = action.payload;
      if (!state.locationGroups) return;
      const index = state.locationGroups.findIndex(
        locationGroup => locationGroup.Id === updatedLocationGroup.Id
      );
      if (index !== -1) {
        state.locationGroups[index] = {
          ...state.locationGroups[index],
          ...updatedLocationGroup,
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
  setLocation,
  clearLocation,
  updateLocation,
  setLocationGroup,
  clearLocationGroups,
  updateLocationGroup,
  setLoading,
  setError,
} = allSettingsSlice.actions;
export default allSettingsSlice.reducer;
