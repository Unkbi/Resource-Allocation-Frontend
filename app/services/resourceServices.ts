import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { Resource } from '../types';

interface PostData {
  [key: string]: any;
}

interface UpdatePayload {
  postData: PostData;
  resourceId: string;
}

export const getAllResources = createAsyncThunk<Resource[]>(
  '/resource',
  async () => {
    const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Resource`);
    return response.data;
  }
);

export const addResource = createAsyncThunk<
  Resource,
  PostData,
  { rejectValue: string }
>(
  '/resource/add',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Resource`,
        postData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to add resource');
    }
  }
);

export const updateResource = createAsyncThunk<
  Resource,
  UpdatePayload,
  { rejectValue: string }
>(
  '/resource/update',
  async ({ postData, resourceId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Resource/${resourceId}`,
        postData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update resource');
    }
  }
);

export const deleteResource = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  '/resource/delete',
  async (resourceId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_PROJECT_PORTFOLIO}/Resource/${resourceId}`);
      return resourceId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete resource');
    }
  }
);

export const createResourceWithTeamAndOrg = createAsyncThunk(
  'resource/createResourceWithTeamAndOrg',
  async (
    {
      resourceData,
      teamId,
      organizationId,
    }: {
      resourceData: any;
      teamId: string;
      organizationId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        'ResourceAllocation.Core/CreateResource': {
          Resource: resourceData,
          Team: teamId,
          Organization: organizationId,
        },
      };

      const response = await axiosInstance.post(
        `/api/ResourceAllocation.Core/CreateResource`,
        payload
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || 'Failed to create resource with team and org.'
      );
    }
  }
);
