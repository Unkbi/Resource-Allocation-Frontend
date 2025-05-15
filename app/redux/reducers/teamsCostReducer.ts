import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TeamCostAllocation {
  id: string;
  Team: string;
  TeamName: string;
  Resource: string;
  ResourceName: string;
  Period: string;
  Duration: 'week' | 'month' | string;
  cost: number;
  teams: string | null;
}

interface TeamCostState {
  costs: TeamCostAllocation[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamCostState = {
  costs: [],
  loading: false,
  error: null,
};

const teamCostSlice = createSlice({
  name: 'teamCosts',
  initialState,
  reducers: {
    setTeamCost: (state, action: PayloadAction<TeamCostAllocation[]>) => {
      state.costs = action.payload;
    },
    setTeamCostProcessing: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateTeamCosts: (state, action: PayloadAction<TeamCostAllocation[]>) => {
      state.costs = action.payload;
    },
    resetTeamCosts: (state) => {
      state.costs = [];
    },
  },
});

export const {
  setTeamCost,
  setTeamCostProcessing,
  updateTeamCosts,
  resetTeamCosts,
} = teamCostSlice.actions;

export default teamCostSlice.reducer;
