// allocationThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

interface PostAllocationParams {
  resourceId: string;
  postData: any;
}

interface PutAllocationParams {
  resourceId: string;
  allocationId: string;
  putData: any;
}

interface DeleteAllocationParams {
  resourceId: string;
  allocationId: string;
}

interface ViewPayload {
  id: string;
  body: any;
}

interface UserViewPayload {
  [key: string]: {
    UserId: string;
  };
}

export const postResourceAllocations = createAsyncThunk<any, PostAllocationParams, { rejectValue: string }>(
  '/allocations/post',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation`,
        params.postData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to set resource allocation');
    }
  }
);

export const putResourceAllocations = createAsyncThunk<any, PutAllocationParams, { rejectValue: string }>(
  '/allocations/put',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`,
        params.putData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to set resource allocation');
    }
  }
);

export const deleteResourceAllocations = createAsyncThunk<any, DeleteAllocationParams, { rejectValue: string }>(
  '/allocations/delete',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete resource allocation');
    }
  }
);

export const deleteRangeAllocation = createAsyncThunk<any, any, { rejectValue: string }>(
  '/allocations/deleteRange',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/RangeAllocationDelete`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error('Bulk delete failed:', error);
      return rejectWithValue(error.response?.data || 'Bulk delete failed');
    }
  }
);

export const getAllSavedViews = createAsyncThunk<any[]>(
  '/views/getAllSavedViews',
  async () => {
    const response = await axiosInstance.get(`${API_PROJECT_PORTFOLIO}/UserAllocationView`);
    return response.data;
  }
);

export const getUsersSavedViews = createAsyncThunk<any, UserViewPayload, { rejectValue: string }>(
  '/views/getUsersSavedViews',
  async (payload, { rejectWithValue }) => {
    try {
      const userid = payload["ResourceAllocation.Core/UserAllocationView"].UserId;
      const response = await axiosInstance.get(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView?UserId="${userid}"`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to get resources saved views');
    }
  }
);

export const updateAllocationView = createAsyncThunk<any, ViewPayload, { rejectValue: string }>(
  '/views/updateAllocationView',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView/${payload.id}`,
        payload.body
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update resources saved views');
    }
  }
);

export const addAllocationView = createAsyncThunk<any, ViewPayload, { rejectValue: string }>(
  '/views/addAllocationView',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView`,
        payload.body
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to update resources saved views');
    }
  }
);

export const deleteAllocationView = createAsyncThunk<any, { id: string }, { rejectValue: string }>(
  '/views/deleteAllocationView',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView/${payload.id}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to delete resources saved views');
    }
  }
);

export const fetchAllAllocations = async (postData: any): Promise<any> => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetAllAllocationsForPeriod`,
    postData
  );
  return response.data;
};
