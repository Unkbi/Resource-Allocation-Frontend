import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const getAllTeams = createAsyncThunk('/team', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Team`);
  return response.data;
});

export const getResourcesAgainstTeams = createAsyncThunk(
  '/team/resources',
  async team => {
    const response = await axiosInstance.get(
      `${API_PROJECT_PORTFOLIO}/Team/${team}/TeamResource/Resource`
    );
    return response.data;
  }
);
