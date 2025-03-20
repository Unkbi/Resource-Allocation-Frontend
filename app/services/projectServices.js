import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const getAllProjects = createAsyncThunk('/project', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Project`);
  return response.data;
});

export const addProject = createAsyncThunk(
  '/project/add',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Project`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add project');
    }
  }
);

export const updateProject = createAsyncThunk(
  '/project/update',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Project`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  '/project/delete',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_PROJECT_PORTFOLIO}/Project/${projectId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to delete project'
      );
    }
  }
);

export const getProjectAllocations = createAsyncThunk(
  '/project/allocations',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetProjectAllocationsForPeriod`,
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
