import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rowState: [],
};

const dataGridSlice = createSlice({
  name: 'dataGrid',
  initialState,
  reducers: {
    setRowState: (state, action) => {
        state.rowState = action.payload;
    },
}});

// Export the actions
export const { setRowState } = dataGridSlice.actions;

// Export the reducer
export default dataGridSlice.reducer;
