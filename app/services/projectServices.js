import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';

export const getAllProjects = createAsyncThunk('/project', async () => {
  const response = await axiosInstance.get('/api/ProjectPortfolio.Core/Project');
  return response.data;
});

export const getProjectAllocations = createAsyncThunk(
  '/project/allocations',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/api/ProjectPortfolio.Core/GetProjectAllocationsForPeriod',
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch allocations'
      );
    }
  }
);
