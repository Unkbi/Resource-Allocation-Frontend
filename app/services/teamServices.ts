import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import {
  GetAllAllocationsForPeriodPayload,
  GetTeamAllocationsForPeriodPayload,
  GetTeamResourcesPayload,
} from '../types';
import { AxiosError } from 'axios';

export const getAllTeams = createAsyncThunk('/team', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Team`);
  return response.data;
});

export const getResourcesAgainstTeams = createAsyncThunk(
  '/team/resources',
  async (postData: GetTeamResourcesPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetTeamResources`,
        postData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data ||
          'Failed to fetch teams resources.'
      );
    }
  }
);

export const fetchAllTeamsForSaga = async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Team`);
  return response.data;
};

export const fetchResourcesAgainstTeamsForSaga = async (
  postData: GetTeamResourcesPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetTeamResources`,
    postData
  );
  return response.data;
};

export const getAllAllocationsForPeriod = createAsyncThunk(
  'team/allAllocations',
  async (postData: GetAllAllocationsForPeriodPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetAllAllocationsForPeriod`,
        postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data ||
          'Failed to fetch all allocations'
      );
    }
  }
);

export const getTeamAllocations = createAsyncThunk(
  'team/allocations',
  async (postData: GetTeamAllocationsForPeriodPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetTeamAllocationsForPeriod`,
        postData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data ||
          'Failed to fetch team allocations'
      );
    }
  }
);

export const fetchTeamAllocationsForSaga = async (
  postData: GetTeamAllocationsForPeriodPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetTeamAllocationsForPeriod`,
    postData
  );
  return response.data;
};

export const addResourceToTeam = createAsyncThunk(
  'team/addResourceToTeam',
  async (
    { teamPath, resourcePath }: { teamPath: string; resourcePath: string },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        'ResourceAllocation.Core/TeamResource': {
          Team: teamPath,
          Resource: resourcePath,
        },
      };

      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/TeamResource`,
        payload
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || 'Failed to assign resource to team.'
      );
    }
  }
);

export const getResourceDetail = createAsyncThunk(
  'resource/getResourceDetail',
  async (resourceId: string, { rejectWithValue }) => {
    try {
      const payload = {
        'ResourceAllocation.Core/GetResourceDetail': {
          Id: resourceId,
        },
      };

      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetResourceDetail`,
        payload
      );

      return response.data?.result;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data || 'Failed to fetch resource detail.'
      );
    }
  }
);

/*
 * Not being used currently in application
 * Uncomment the following code if you want to handle postTeamResource API call
 */
// export const postTeamResource = createAsyncThunk(
//   'team/addResource',
//   async (postData, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.post(
//         `${API_PROJECT_PORTFOLIO}/TeamResource`,
//         postData
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || 'Failed to add resource to team'
//       );
//     }
//   }
// );
