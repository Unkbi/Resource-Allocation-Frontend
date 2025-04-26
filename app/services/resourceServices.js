import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const getAllResources = createAsyncThunk('/resource', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Resource`);
  return response.data;
});

export const addResource = createAsyncThunk(
  '/resource/add',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Resource`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to add resource'
      );
    }
  }
);

export const updateResource = createAsyncThunk(
  '/resource/update',
  async ({ postData, resourceId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Resource/${resourceId}`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to update resource'
      );
    }
  }
);


export const deleteResource = createAsyncThunk(
  '/resource/delete',
  async (resourceId , { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_PROJECT_PORTFOLIO}/Resource/${resourceId}`
      );
      return resourceId ;
    } catch (error) {
      return rejectWithValue(
        (error).response?.data || 'Failed to delete resource'
      );
    }
  }
);


