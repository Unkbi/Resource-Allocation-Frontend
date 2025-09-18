import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  confirmForgotPassword,
  forgotPassword,
  loginUser,
  logoutUser,
  confirmSignUp,
  signupUser,
  getUser,
  resendConfirmationCode,
} from '@/app/services/authServices'; 

import type { LoginUser } from '@/app/types/authTypes';

export interface AuthState {
  user: LoginUser | null;
  token: string | null;
  loading: boolean;
  signupData: Record<string, any> | null;
  error: string | null;
  forgotPasswordMessage: string | null;
  resetPasswordMessage: string | null;
  otpVerified: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  signupData: null,
  error: null,
  forgotPasswordMessage: null,
  resetPasswordMessage: null,
  otpVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateSignup: (state, action: PayloadAction<Record<string, any>>) => {
      state.signupData = action.payload;
    },
    logout: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Login Actions
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginUser & { 'id-token': string }>) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload['id-token'];
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      })

      // Logout Actions
      .addCase(logoutUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Logout failed';
      })

      // Signup Actions
      .addCase(signupUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(signupUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Signup failed';
      })

      // Forgot Password
      .addCase(forgotPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action: PayloadAction<{ statusText: string }>) => {
        state.loading = false;
        state.forgotPasswordMessage = action.payload.statusText;
      })
      .addCase(forgotPassword.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Forgot password failed';
      })

      // Confirm Forgot Password
      .addCase(confirmForgotPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmForgotPassword.fulfilled, (state, action: PayloadAction<{ message: string }>) => {
        state.loading = false;
        state.resetPasswordMessage = action.payload.message;
      })
      .addCase(confirmForgotPassword.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Reset password failed';
      })

      // Confirm Signup
      .addCase(confirmSignUp.pending, state => {
        state.loading = true;
        state.error = null;
        state.otpVerified = false;
      })
      .addCase(confirmSignUp.fulfilled, (state, action: PayloadAction<{ user: LoginUser; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.otpVerified = true;
      })
      .addCase(confirmSignUp.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Confirm signup failed';
        state.otpVerified = false;
      })

      // Resend OTP
      .addCase(resendConfirmationCode.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendConfirmationCode.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resendConfirmationCode.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Resend code failed';
      })

      // Get User
      .addCase(getUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<LoginUser>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload ?? 'Get user failed';
      });
  },
});

export const { updateSignup, logout } = authSlice.actions;
export default authSlice.reducer;
