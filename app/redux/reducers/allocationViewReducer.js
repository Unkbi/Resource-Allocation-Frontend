import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  view: 'Project',
  loading: false,
  error: null,
};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    changeView: (state, action) => {
      state.view = action.payload;
    },
  },
  extraReducers: (builder) => {
  },
});

export const { changeView } = viewSlice.actions;
export default viewSlice.reducer;
