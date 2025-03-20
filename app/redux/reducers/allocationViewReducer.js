import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  view: 'Teams',
  loading: false,
  error: null,
  expandRowId: null,
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    changeView: (state, action) => {
      state.view = action.payload;
    },
    setExpandRowId: (state, action) => {
      state.expandRowId = action.payload;
    },
  },
  extraReducers: (builder) => {
  },
});

export const { changeView, setExpandRowId } = viewSlice.actions;
export default viewSlice.reducer;
