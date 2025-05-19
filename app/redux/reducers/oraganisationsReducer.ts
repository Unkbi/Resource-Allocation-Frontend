import { OrganisationState } from '@/app/types/organisationTypes';
import { createSlice } from '@reduxjs/toolkit';

const initialState: OrganisationState = {
  organisations: [],
  loading: false,
  error: null,
};

const organisationsSlice = createSlice({
  name: 'organisations',
  initialState,
  reducers: {
    setOrganisations: (state, action) => {
      state.organisations = action.payload;
    },
    clearOrganisations: state => {
      state.organisations = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setOrganisations, clearOrganisations, setLoading, setError } =
  organisationsSlice.actions;
export default organisationsSlice.reducer;
