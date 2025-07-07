import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';

export const postResourceAllocations = createAsyncThunk(
  '/allocations/post',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation`,
        params.postData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to set resource allocation'
      );
    }
  }
);

export const putResourceAllocations = createAsyncThunk(
  '/allocations/put',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`,
        params.putData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to set resource allocation'
      );
    }
  }
);

// export const deleteResourceAllocations = createAsyncThunk(
//   '/allocations/delete',
//   async (params, { rejectWithValue }) => {
//     try {
//       const response = await axiosInstance.delete(
//         `${API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || 'Failed to delete resource allocation'
//       );
//     }
//   }
// );

// Updated deleteResourceAllocations to permanently remove the allocation.
export const deleteResourceAllocations = createAsyncThunk(
  '/allocations/delete',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/DeleteAllocation`,
        {
          'ResourceAllocation.Core/DeleteAllocation': {
            Id: params.allocationId,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to delete resource allocation'
      );
    }
  }
);

export const getAllSavedViews = createAsyncThunk(
  '/views/getAllSavedViews',
  async () => {
    const response = await axiosInstance.get(
      `${API_PROJECT_PORTFOLIO}/UserAllocationView`
    );
    return response.data;
  }
);

export const getUsersSavedViews = createAsyncThunk(
  '/views/getUsersSavedViews',
  async (payload, { rejectWithValue }) => {
    try {
      const userid =
        payload['ResourceAllocation.Core/UserAllocationView'].UserId;
      const response = await axiosInstance.get(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView?UserId="${userid}"`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to get resources saved views'
      );
    }
  }
);

export const updateAllocationView = createAsyncThunk(
  '/views/updateAllocationView',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView/${payload.id}`,
        payload.body
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to update resources saved views'
      );
    }
  }
);

export const addAllocationView = createAsyncThunk(
  '/views/addAllocationView',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView`,
        payload.body
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to update resources saved views'
      );
    }
  }
);

export const deleteAllocationView = createAsyncThunk(
  '/views/deleteAllocationView',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_PROJECT_PORTFOLIO}/UserAllocationView/${payload.id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to delete resources saved views'
      );
    }
  }
);

export const fetchAllAllocations = async postData => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetAllAllocationsForPeriod`,
    postData
  );
  return response.data;
};

export const bulkUpdateAllocations = async postData => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/RangeAllocationUpsert`,
    postData
  );
  return response.data;
};

export const bulkDeleteAllocations = async postData => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/RangeAllocationDelete`,
    postData
  );
  return response.data;
};

export const fetchHistory = async payload => {
  let response;
  response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetAllocationHistory`,
    {
      'ResourceAllocation.Core/GetAllocationHistory': payload,
    }
  );
  return response.data;
};
