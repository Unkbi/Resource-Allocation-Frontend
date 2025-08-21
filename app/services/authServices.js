import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import {
  clearAuth,
  clearToken,
  saveRefreshToken,
  saveToken,
  saveUserId,
} from '../utils/authUtils';

// Login User
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/agentlang.auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      const data = response.data;
      const token =
        data.userId && data.sessionId
          ? `${data.userId}/${data.sessionId}`
          : data.id_Token;
      saveToken(token);
      saveUserId(data.userId);
      saveRefreshToken(data.refresh_token);
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.reason ||
        'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Get User
export const getUser = createAsyncThunk('auth/getUser', async userId => {
  try {
    const response = await axiosInstance.post('/agentlang.auth/getUser', {
      userId,
    });
    return response.data;
  } catch (error) {
    return 'User not found';
  }
});

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/agentlang.auth/signup', data);
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
      const response = await axiosInstance.post('/agentlang.auth/confirmSignup', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.reason || 'Signup failed');
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  clearAuth();
  return;
});

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('agentlang.auth/forgotPassword', data);
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
        'agentlang.auth/confirmForgotPassword',
        data
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.reason || 'Failed to reset password'
      );
    }
  }
);

export const resendConfirmationCode = createAsyncThunk(
  'auth/resendConfirmationCode',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/resend-confirmation-code',
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.reason || 'Failed to resend OTP'
      );
    }
  }
);
