import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const getAllOrganizations = createAsyncThunk('/organization', async () => {
  const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/Organization`);
  return response.data;
});

  
export const getOrganizationAllocations = createAsyncThunk(
'organization/allocations',
async (postData, { rejectWithValue }) => {
    try {
    const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/GetOrganizationAllocations`,
        postData
    );
    
    return response.data;
    } catch (error) {
    return rejectWithValue(
        error.response?.data || 'Failed to fetch organization allocations'
    );
    }
}
);

export const getOrganizationResources = createAsyncThunk(
'organization/addResource',
async (postData, { rejectWithValue }) => {
    try {
    const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/TeamResource`,
        postData
    );
    return response.data;
    } catch (error) {
    return rejectWithValue(
        error.response?.data || 'Failed to add resource to organization'
    );
    }
}
);
