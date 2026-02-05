import { createSlice, PayloadAction } from '@reduxjs/toolkit';


export interface FilterItem {
  field: string;
  operator?: string;
  operatorValue?: string;
  value: any;
  id: number;
}

export interface FilterState {
  Resource: FilterItem[];
  Project: FilterItem[];
  Teams: FilterItem[];
  Organisations: FilterItem[];
  Rates : FilterItem[];
  Portfolio: FilterItem[];
  BusinessImpact: FilterItem[];
}

const initialState: FilterState = {
  Resource: [],
  Project: [],
  Teams: [],
  Organisations: [],
  Rates: [],
  Portfolio: [],
  BusinessImpact: [],
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    updateFiltersForPage: (
      state,
      action: PayloadAction<{
        page: 'Resource' | 'Project'| 'Teams' | 'Organisations' | 'Rates' | 'Portfolio' | 'BusinessImpact';
        filters: FilterItem[];
      }>
      ) => {
      state[action.payload.page] = action.payload.filters  ;
    },
    clearFiltersForPage: (
      state,
      action: PayloadAction<'Resource' | 'Project'| 'Teams' | 'Organisations' | 'Rates' | 'Portfolio' | 'BusinessImpact'>
    ) => {
      state[action.payload] = [];
    },
    resetAllFilters: () => initialState,
  },
});

export const {
  updateFiltersForPage,
  clearFiltersForPage,
  resetAllFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
