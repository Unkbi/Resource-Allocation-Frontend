// store/reducers/themeReducer.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AllocationRange {
  id: number;
  from: string;
  to: string;
  label: string;
  color: string;
  darkColor: string;
}

interface ThemeState {
  allocationTheme: AllocationRange[];
}

const initialState: ThemeState = {
  allocationTheme: [
    {
      id: 1,
      from: '0.0',
      to: '0.0',
      label: 'No Allocation',
      color: '#FFFFFF',
      darkColor: '#FFFFFF', 
    },
    {
      id: 2,
      from: '0.1',
      to: '0.4',
      label: 'Partially Allocated',
      color: '#DEEBF7',
      darkColor: '#7B9CB9', 
    },
    {
      id: 3,
      from: '0.5',
      to: '0.8',
      label: 'Nearly Allocated',
      color: '#FFF2CC',
      darkColor: '#F0D776', 
    },
    {
      id: 4,
      from: '0.9',
      to: '1.0',
      label: 'Fully  Allocated',
      color: '#C6F5E2',
      darkColor: '#3CB371', 
    },
    {
      id: 5,
      from: '1.1',
      to: '2.0',
      label: 'Over  Allocated',
      color: '#F8D7D7',
      darkColor: '#D66E6E', 
    },
    
  ],
};

export const settings = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateAllocationTheme: (state, action: PayloadAction<AllocationRange[]>) => {
      state.allocationTheme = action.payload;
    },
  },
});

export const { updateAllocationTheme } = settings.actions;
export default settings.reducer;