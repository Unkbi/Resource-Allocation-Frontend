import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rowState: [],
  allocations: {},
};

const dataGridSlice = createSlice({
  name: 'dataGrid',
  initialState,
  reducers: {
    setRowState: (state, action) => {
        state.rowState = action.payload;
    },
    setAllocations: (state, action) => {
        state.allocations[action.payload.team_id] = action.payload.value;
    },
}});

// Export the actions
export const { setRowState, setAllocations } = dataGridSlice.actions;

// Export the reducer
export default dataGridSlice.reducer;
