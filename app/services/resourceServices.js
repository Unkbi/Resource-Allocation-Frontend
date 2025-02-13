import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const getAllResources = createAsyncThunk('/resource', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Resource`);
  return response.data;
});
