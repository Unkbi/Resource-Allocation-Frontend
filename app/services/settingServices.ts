import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { AxiosError } from 'axios';
import { AllocationRangePayload } from '../types';


export const getAllocationTheme = createAsyncThunk(
  '/AllocationRangeSetting/get',
  async () => {
    try {
      const response = await axiosInstance.get(
        `${API_PROJECT_PORTFOLIO}/AllocationRangeSetting`,
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  }
);

export const addAllocationTheme = createAsyncThunk(
  '/AllocationRangeSetting/add',
  async (postData: AllocationRangePayload[], { rejectWithValue }) => {
    try {
      const formattedPayload = {
          AllocationRanges: postData ,
      };
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/AllocationRangeSetting`,
        formattedPayload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to add project'
      );
    }
  }
);

export const updateAllocationThemes = createAsyncThunk(
  '/AllocationRangeSetting/update',
  async (
    { postData,  __Id__ }: { postData: AllocationRangePayload[];  __Id__: string },
    { rejectWithValue }
  ) => {
    try {
      const formattedPayload = {
        "ResourceAllocation.Core/AllocationRangeSetting": {
          "AllocationRanges": postData
        }
      };
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/AllocationRangeSetting/${ __Id__}`,
        formattedPayload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to update project'
      );
    }
  }
);


