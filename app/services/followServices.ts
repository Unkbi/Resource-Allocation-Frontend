import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { AxiosError } from 'axios';

export interface FollowPayload {
  ObjectType: 'PROJECT' | 'TEAM';
  ObjectId: string;
  User: string;
  WeeklySummaryEnabled: boolean;
  PlanChangesDailySummary: boolean;
  ActualsStatusDailySummary: boolean;
}

export interface GetFollowsPayload {
  User: string;
}

export interface UpdateFollowPreferencesPayload {
  FollowId: string;
  WeeklySummaryEnabled: boolean;
  PlanChangesDailySummary: boolean;
  ActualsStatusDailySummary: boolean;
}

export interface UnfollowPayload {
  FollowId: string;
}

export interface FollowResponse {
  FollowId: string;
  ObjectType: 'PROJECT' | 'TEAM';
  ObjectId: string;
  User: string;
  WeeklySummaryEnabled: boolean;
  PlanChangesDailySummary: boolean;
  ActualsStatusDailySummary: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

// Plain service functions for use in sagas
export const followService = {
  getFollows: async (userId: string) => {
    const response = await axiosInstance.post(
      `${API_PROJECT_PORTFOLIO}/GetFollows`,
      { User: userId }
    );
    return response.data;
  },

  createFollow: async (payload: FollowPayload) => {
    const response = await axiosInstance.post(
      `${API_PROJECT_PORTFOLIO}/Follow`,
      payload
    );
    return response.data;
  },

  updateFollowPreferences: async (payload: UpdateFollowPreferencesPayload) => {
const { FollowId, ...rest } = payload;
const response = await axiosInstance.put(
  `${API_PROJECT_PORTFOLIO}/Follow/${FollowId}`,
  {...rest }
);
    return response.data;
  },

  unfollow: async (payload: UnfollowPayload) => {
    const response = await axiosInstance.post(
      `${API_PROJECT_PORTFOLIO}/Unfollow`,
      payload
    );
    return response.data;
  },
};

// Create a follow (Project or Team)
export const createFollow = createAsyncThunk(
  'follow/create',
  async (payload: FollowPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Follow`,
        payload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to follow'
      );
    }
  }
);

// Get all follows for a user
export const getFollows = createAsyncThunk(
  'follow/getAll',
  async (payload: GetFollowsPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetFollows`,
        payload
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to fetch follows'
      );
    }
  }
);

// Update follow preferences
export const updateFollowPreferences = createAsyncThunk(
  'follow/updatePreferences',
  async (payload: UpdateFollowPreferencesPayload, { rejectWithValue }) => {
    try {
      const { FollowId, ...rest } = payload;
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Follow/${payload.FollowId}`,
        {...rest }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data ||
          'Failed to update follow preferences'
      );
    }
  }
);

// Unfollow a project or team
export const unfollow = createAsyncThunk(
  'follow/unfollow',
  async (payload: UnfollowPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Unfollow`,
        payload
      );
      return { ...response.data, FollowId: payload.FollowId };
    } catch (error) {
      return rejectWithValue(
        (error as AxiosError).response?.data || 'Failed to unfollow'
      );
    }
  }
);
