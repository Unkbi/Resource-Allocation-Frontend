import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import {
  GetAllAllocationsForPeriodPayload,
  GetResourceAllocationsForPeriodPayload,
  GetTeamAllocationsForPeriodPayload,
  GetTeamResourcesPayload,
  TeamResourcePayload,
  TransferAllocationsPayload,
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

export const fetchTransferAllocationsForSaga = async (
  postData: TransferAllocationsPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/TransferAllocations`,
    postData
  );
  return response.data;
};

export const fetchResourceAllocationsForSaga = async (
  postData: GetResourceAllocationsForPeriodPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetResourceAllocationsForPeriod`,
    postData
  );
  return response.data;
};

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

export const createTeam = createAsyncThunk(
  'team/createTeam',
  async (
    {
      Name,
      AllocationManager,
      Status,
    }: {
      Name: string;
      AllocationManager: string;
      Status: 'Active' | 'Inactive';
    },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        'ResourceAllocation.Core/Team': {
          Name,
          AllocationManager,
          Status,
        },
      };

      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Team`,
        payload
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Failed to create team.');
    }
  }
);

export const updateTeam = createAsyncThunk<
  any,
  { postData: any; teamId: string },
  { rejectValue: string }
>('team/updateTeam', async ({ postData, teamId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `${API_PROJECT_PORTFOLIO}/Team/${teamId}`,
      postData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || 'Failed to update team.');
  }
});

export const deleteTeam = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('/team/delete', async (teamId, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_PROJECT_PORTFOLIO}/Team/${teamId}`);
    return teamId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data || 'Failed to delete team');
  }
});

/*
 * Not being used currently in application
 * Uncomment the following code if you want to handle postTeamResource API call
 */
export const postTeamResource = async (postData: TeamResourcePayload) => {
  try {
    const response = await axiosInstance.post(
      `${API_PROJECT_PORTFOLIO}/ChangeTeamResource`,
      postData
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to add resource to team:', error);
    throw error;
  }
};

export const updateOrganization = createAsyncThunk<
  any,
  { postData: any; organizationId: string },
  { rejectValue: string }
>('organization/updateOrganization', async ({ postData, organizationId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `${API_PROJECT_PORTFOLIO}/Organization/${organizationId}`,
      postData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || 'Failed to update organization.');
  }
});