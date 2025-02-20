import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const getAllProjects = createAsyncThunk('/project', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Project`);
  return response.data;
});

export const getProjectAllocations = createAsyncThunk(
  '/project/allocations',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetProjectAllocationsForPeriod`,
        postData
      );
      /**
         @todo: Converting nested array into flat to accomodate nested array issue in API response.
         Needs to be reverted later.
      **/
      const formattedData = [
        {
          status: response?.data?.[0]?.status,
          message: response.data?.[0]?.message,
          result: response?.data?.[0].result.flat(),
        },
      ];

      return formattedData;
      //Commented out as of now. Needs to be reverted later.
      // return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to fetch allocations'
      );
    }
  }
);
