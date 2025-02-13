import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const postResourceAllocations = createAsyncThunk(
  '/allocations/post',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation`,
        params.postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to set resource allocation'
      );
    }
  }
);

export const putResourceAllocations = createAsyncThunk(
  '/allocations/put',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`,
        params.putData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to set resource allocation'
      );
    }
  }
);
