import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';

export const getAllResources = createAsyncThunk('/resource', async () => {
  const response = await axiosInstance.get('/api/ProjectPortfolio.Core/Resource');
  return response.data;
});
