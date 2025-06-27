import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { clearToken, saveRefreshToken, saveToken } from '../utils/authUtils';

interface Credentials {
  email: string;
  password: string;
}

interface AuthResponse {
  'id-token': string;
  'refresh-token': string;
}

// interface LoginResponse {
//   'authentication-result': AuthResponse;
// }

interface SignupData {
  email: string;
  password: string;
  // [key: string]: any; not sure if we need this
}

interface ConfirmSignUpData {
  email: string;
  code: string;
}

interface ForgotPasswordData {
  'Agentlang.Kernel.Identity/ForgotPassword': {
    Username: string;
  };
}

interface ConfirmForgotPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

interface SignupData {
  'Agentlang.Kernel.Identity/SignUp': {
    User: {
      'Agentlang.Kernel.Identity/User': {
        Name: string;
        FirstName: string;
        LastName: string;
        Email: string;
        UserData: {
          PhoneNumber: string;
        };
        Password: string;
      };
    };
  };
}

// Login User
export const loginUser = createAsyncThunk<AuthResponse, Credentials, {rejectValue: string}>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      
      const response = await axiosInstance.post('/login', credentials);
      const data = response.data.result['authentication-result'];
      saveToken(data['id-token']);
      saveRefreshToken(data['refresh-token']);
      return data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.reason || 'Login failed');
    }
  }
);

// Get User
export const getUser = createAsyncThunk<any>(
  'auth/getUser',
  async () => {
    try {
      const response = await axiosInstance.post('/get-user');
      return response.data.result; 
    } catch (error) {
      return 'User not found'; 
    }
  }
);


export const signupUser = createAsyncThunk<any, SignupData, { rejectValue: string }>(
  'auth/signupUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/signup', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.reason || 'Signup failed');
    }
  }
);

export const confirmSignUp = createAsyncThunk<any, ConfirmSignUpData, { rejectValue: string }>(
  'auth/confirmSignUp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/confirm-sign-up', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.reason || 'Signup failed');
    }
  }
);


// Logout User
export const logoutUser = createAsyncThunk<void>('auth/logoutUser', async () => {
  clearToken();
  return;
});

export const forgotPassword = createAsyncThunk<any, ForgotPasswordData, { rejectValue: string }>(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/forgot-password', data);
      return response; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.reason || 'Failed to send reset link');
    }
  }
);

export const confirmForgotPassword = createAsyncThunk<string, ConfirmForgotPasswordData, { rejectValue: string }>(
  'auth/confirmForgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/confirm-forgot-password', data);
      return response.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.reason || 'Failed to reset password');
    }
  }
);
