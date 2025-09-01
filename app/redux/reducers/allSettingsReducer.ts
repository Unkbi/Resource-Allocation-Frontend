import { AllSettings } from '@/app/types/allSettingsType';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState: AllSettings = {
  allocationTheme: [],
  projectTypes: [],
  loading: false,
  error: null,
};

const allSettingsSlice = createSlice({
  name: 'allSettings',
  initialState,
  reducers: {
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
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProjectTypes,
  clearProjectTypes,
  updateProjectType,
  setLoading,
  setError,
} = allSettingsSlice.actions;
export default allSettingsSlice.reducer;
