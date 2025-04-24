import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  //   rowState: [],
  allAllocations: [],
  dataProcessing: false,
  loading: false,
};

const allAllocationsSlice = createSlice({
  name: 'allAllocations',
  initialState,
  reducers: {
    // setRowState: (state, action) => {
    //   state.rowState = action.payload;
    // },
    setAllAllocations: (state, action) => {
      state.allAllocations = action.payload;
    },
    resetAllocations: state => {
      state.allAllocations = [];
    },
    setDataProcessing: (state, action) => {
      state.dataProcessing = action.payload;
    },
  },
  extraReducers: builder => {
    builder;
    // Handle getAllAllocations API call
  },
});

// Export the actions
export const {
  // setRowState,
  setAllAllocations,
  resetAllocations,
  setDataProcessing,
} = allAllocationsSlice.actions;

// Export the reducer
export default allAllocationsSlice.reducer;
