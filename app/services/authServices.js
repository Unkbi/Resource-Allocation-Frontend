import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';
import { clearToken, saveToken } from '../utils/authUtils';

// Login User
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('credentials', credentials);
      const response = await axiosInstance.post('/login', credentials);
      const { user, token } = response.data;
      saveToken(token);
      return { user, token }; 
    } catch (error) {
      console.error('Login failed:', error.response);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  clearToken();
  return;
});
