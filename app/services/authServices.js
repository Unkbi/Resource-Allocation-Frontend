import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { clearToken, saveRefreshToken, saveToken } from '../utils/authUtils';

// Login User
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/login', credentials);
      const data = response.data.result['authentication-result'];
      saveToken(data['id-token']);
      saveRefreshToken(data['refresh-token']);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.reason || 'Login failed');
    }
  }
);

// Get User
export const getUser = createAsyncThunk('auth/getUser', async () => {
  try {
    const response = await axiosInstance.post('/get-user');
    return response.data.result;
  } catch (error) {
    return 'User not found';
  }
});

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/signup', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.reason || 'Signup failed');
    }
  }
);

export const confirmSignUp = createAsyncThunk(
  'auth/confirmSignUp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/confirm-sign-up', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.reason || 'Signup failed');
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  clearToken();
  return;
});

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/forgot-password', data);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.reason || 'Failed to send reset link'
      );
    }
  }
);

export const confirmForgotPassword = createAsyncThunk(
  'auth/confirmForgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/confirm-forgot-password',
        data
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.reason || 'Failed to reset password'
      );
    }
  }
);
