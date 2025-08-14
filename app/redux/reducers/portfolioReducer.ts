import { PortfolioState } from '@/app/types/portfolioTypes';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState: PortfolioState = {
  portfolios: [],
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolios',
  initialState,
  reducers: {
    setPortfolios: (state, action) => {
      state.portfolios = formatAPIResponse('Portfolio', action.payload);
    },
    clearPortfolios: state => {
      state.portfolios = [];
    },
    updatePortfolios: (state, action) => {
      const updatedPortfolios = action.payload;
      if (!state.portfolios) return;
      const index = state.portfolios.findIndex(
        portfolio => portfolio.Id === updatedPortfolios.Id
      );
      if (index !== -1) {
        state.portfolios[index] = {
          ...state.portfolios[index],
          ...updatedPortfolios,
        };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPortfolios,
  clearPortfolios,
  setLoading,
  setError,
  updatePortfolios,
} = portfolioSlice.actions;
export default portfolioSlice.reducer;
