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
