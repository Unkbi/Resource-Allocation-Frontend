import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/apiClient';

// Login User
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const { user, token } = response.data;

      // Store the token in localStorage
      localStorage.setItem('token', token);

      return { user, token }; // Fulfilled payload
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  localStorage.removeItem('token'); // Clear token from storage
  return; // Fulfilled payload will be `undefined`
});
