import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import {
  clearAuth,
  clearToken,
  saveRefreshToken,
  saveToken,
  saveUserId,
} from '../utils/authUtils';
import type {
  LoginPayload,
  LoginUser,
} from '@/app/types/authTypes'; // adjust path to your types

export const loginUser = createAsyncThunk<
  LoginUser & { 'id-token': string }, // required now
  LoginPayload,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/agentlang.auth/login', {
      email: credentials.Username,
      password: credentials.Password,
    });
    const data = response.data;
    const token =
      data.userId && data.sessionId
        ? `${data.userId}/${data.sessionId}`
        : data['id-token'];
    saveToken(token);
    saveUserId(data.userId);
    saveRefreshToken(data.refresh_token);
    return { ...data, 'id-token': token }; // make sure id-token exists
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Login failed'
    );
  }
});

// ---------- GET USER ----------
export const getUser = createAsyncThunk<
  LoginUser,
  string,
  { rejectValue: string }
>('auth/getUser', async (userId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/agentlang.auth/getUser', {
      userId,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue('User not found');
  }
});

// ---------- SIGNUP ----------
export const signupUser = createAsyncThunk<
  unknown,
  Record<string, unknown>,
  { rejectValue: string }
>('auth/signupUser', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post('/agentlang.auth/signup', data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.reason || 'Signup failed');
  }
});

// ---------- CONFIRM SIGNUP ----------
export const confirmSignUp = createAsyncThunk<
  { user: LoginUser; token: string },
  Record<string, unknown>,
  { rejectValue: string }
>('auth/confirmSignUp', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      '/agentlang.auth/confirmSignup',
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.reason || 'Signup failed');
  }
});

// ---------- LOGOUT ----------
export const logoutUser = createAsyncThunk<
  void, // return type
  void, // arg type
  { rejectValue: string } // <-- this makes payload typed
>('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    clearAuth();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Logout failed');
  }
});


// ---------- FORGOT PASSWORD ----------
export const forgotPassword = createAsyncThunk<
  { statusText: string },
  Record<string, unknown>,
  { rejectValue: string }
>('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      'agentlang.auth/forgotPassword',
      data
    );
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.reason || 'Failed to send reset link'
    );
  }
});

export const confirmForgotPassword = createAsyncThunk<
  { message: string },        // fulfilled return type
  Record<string, unknown>,    // argument type
  { rejectValue: string }     // thunk API config
>(
  'auth/confirmForgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        'agentlang.auth/confirmForgotPassword',
        data
      );
      return response.data; // <-- only the data part
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.reason || 'Failed to reset password'
      );
    }
  }
);
// ---------- RESEND CONFIRMATION CODE ----------
export const resendConfirmationCode = createAsyncThunk<
  unknown,
  string,
  { rejectValue: string }
>('auth/resendConfirmationCode', async (email, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      '/agentlang.auth/resendConfirmationCode',
      { email }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.reason || 'Failed to resend OTP'
    );
  }
});
