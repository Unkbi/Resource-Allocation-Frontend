import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { AxiosError } from 'axios';
import { GetProjectAllocationsForPeriodPayload, Project } from '../types';

export const getAllProjects = createAsyncThunk('/project', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Project`);
  return response.data;
});

export const addProject = createAsyncThunk(
  '/project/add',
  async (postData: Project, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Project`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to add project'
      );
    }
  }
);

export const updateProject = createAsyncThunk(
  '/project/update',
  async (
    { postData, projectId }: { postData: Project; projectId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Project/${projectId}`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to update project'
      );
    }
  }
);

export const deleteProject = createAsyncThunk<
  string, 
  { projectId: string; hardDelete?: boolean },
  { rejectValue: any }
>(
  '/project/delete',
  async ({ projectId, hardDelete = true }, { rejectWithValue }) => {
    try {
       const response = await axiosInstance.delete(`${API_PROJECT_PORTFOLIO}/Project/${projectId}`, {
        params: { purge: hardDelete },
      });

      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete project');
    }
  }
);

export const getProjectAllocations = createAsyncThunk(
  '/project/allocations',
  async (
    postData: GetProjectAllocationsForPeriodPayload,
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetProjectAllocationsForPeriod`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to fetch allocations'
      );
    }
  }
);

export const fetchProjectAllocationsForSaga = async (
  postData: GetProjectAllocationsForPeriodPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetProjectAllocations`,
    postData
  );
  return response.data;
};
