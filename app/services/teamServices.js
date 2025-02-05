import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';

export const getAllTeams = createAsyncThunk('/team', async () => {
  const response = await axiosInstance.get('/ProjectPortfolio.Core/Team');
  return response.data;
});
