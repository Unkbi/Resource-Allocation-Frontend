// src/reducers/projectCostSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ProjectCostAllocation {
  id: string;
  Project: string;
  ProjectName: string;
  Resource: string;
  ResourceName: string;
  Period: string;    
  Duration: 'week' | 'month' | string;
  cost: number;
}

interface ProjectCostState {
  costs: ProjectCostAllocation[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectCostState = {
  costs: [],
  loading: false,
  error: null,
};

const projectCostSlice = createSlice({
  name: 'projectCosts',
  initialState,
  reducers: {
    setCost: (state, action) => {
      state.costs = action.payload;
    },
    setDataProcessing: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateProjectCosts: (state, action: PayloadAction<ProjectCostAllocation[]>) => {
      state.costs = action.payload;
    },
    resetProjectCosts: (state) => {
      state.costs = [];
    },
  },
});

export const {
  setCost,
  setDataProcessing,
  updateProjectCosts,
  resetProjectCosts,
} = projectCostSlice.actions;

export default projectCostSlice.reducer;
