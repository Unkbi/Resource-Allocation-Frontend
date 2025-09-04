import { Resource } from '@/app/types';
import { OrganisationState } from '@/app/types/organisationTypes';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState: OrganisationState = {
  organisations: [],
  organisationsResources: {},
  loading: false,
  error: null,
};

const organisationsSlice = createSlice({
  name: 'organisations',
  initialState,
  reducers: {
    setOrganisations: (state, action) => {
      state.organisations = formatAPIResponse('Organization', action.payload);
    },
    clearOrganisations: state => {
      state.organisations = [];
    },
    setAllOrganisationsResources: (state, action) => {
      action.payload.forEach(
        (payload: { id: string; resource: Resource[] }) => {
          state.organisationsResources = state.organisationsResources || {};
          state.organisationsResources[payload.id] = payload.resource;
        }
      );
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
  setOrganisations,
  clearOrganisations,
  setAllOrganisationsResources,
  setLoading,
  setError,
} = organisationsSlice.actions;
export default organisationsSlice.reducer;
