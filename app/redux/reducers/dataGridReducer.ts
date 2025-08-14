import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of your state
interface DataGridState {
  rowState: any[]; 
  allocations: {
    [teamId: string]: any; 
  };
}

const initialState: DataGridState = {
  rowState: [],
  allocations: {},
};

const dataGridSlice = createSlice({
  name: 'dataGrid',
  initialState,
  reducers: {
    setRowState: (state, action: PayloadAction<any[]>) => {
      state.rowState = action.payload;
    },
    setAllocations: (state, action: PayloadAction<{ team_id: string; value: any }>) => {
      state.allocations[action.payload.team_id] = action.payload.value;
    },
  },
});

export const { setRowState, setAllocations } = dataGridSlice.actions;
export default dataGridSlice.reducer;


