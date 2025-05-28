import { createSlice } from '@reduxjs/toolkit';
import { AllResourcesDetailState } from '@/app/types/resourceTypes';

const initialState: AllResourcesDetailState = {
  allResourcesDetail: [],
  loading: false,
  error: null,
  dataProcessing: false,
};

const allResourcesDetailSlice = createSlice({
  name: 'allResourcesDetail',
  initialState,
  reducers: {
    setAllResourcesDetail: (state, action) => {
      state.allResourcesDetail = action.payload;
    },
    clearAllResourcesDetail: state => {
      state.allResourcesDetail = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
  },
});

export const {
  setAllResourcesDetail,
  clearAllResourcesDetail,
  setLoading,
  setError,
  setDataProcessing,
} = allResourcesDetailSlice.actions;

export default allResourcesDetailSlice.reducer;
