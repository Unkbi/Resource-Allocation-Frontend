import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';

export const postResourceAllocations = createAsyncThunk(
  '/allocations/post',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `ProjectPortfolio.Core/Resource/${params.resourceId}/ResourceAllocation/Allocation`,
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
        `ProjectPortfolio.Core/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`,
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
