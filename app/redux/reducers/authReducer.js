import { createSlice } from '@reduxjs/toolkit';
import { confirmForgotPassword, forgotPassword, loginUser, logoutUser,confirmSignUp, signupUser } from '../../services/authServices';

const initialState = {
  user: null,
  token: null,
  loading: false,
  signupData: '',
  error: null,
  forgotPasswordMessage: null,
  resetPasswordMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateSignup: (state, action) => {
      state.signupData = action.payload;
    },
    logout: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Login Actions
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload['id-token'];
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout Actions
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Signup Actions
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // forgot
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordMessage = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // confirm forgot password
      .addCase(confirmForgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmForgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordMessage = action.payload.message;
      })
      .addCase(confirmForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // confirm signup
      .addCase(confirmSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmSignUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(confirmSignUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { updateSignup } = authSlice.actions;
export default authSlice.reducer;
