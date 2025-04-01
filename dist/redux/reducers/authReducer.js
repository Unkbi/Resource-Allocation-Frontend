"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSignup = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const authServices_1 = require("../../services/authServices");
const initialState = {
    user: null,
    token: null,
    loading: false,
    signupData: '',
    error: null,
    forgotPasswordMessage: null,
    resetPasswordMessage: null,
};
const authSlice = (0, toolkit_1.createSlice)({
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
            .addCase(authServices_1.loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(authServices_1.loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.token = action.payload['id-token'];
        })
            .addCase(authServices_1.loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // Logout Actions
            .addCase(authServices_1.logoutUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(authServices_1.logoutUser.fulfilled, (state) => {
            state.loading = false;
            state.user = null;
            state.token = null;
        })
            .addCase(authServices_1.logoutUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // Signup Actions
            .addCase(authServices_1.signupUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(authServices_1.signupUser.fulfilled, (state) => {
            state.loading = false;
            state.user = null;
            state.token = null;
        })
            .addCase(authServices_1.signupUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // forgot
            .addCase(authServices_1.forgotPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(authServices_1.forgotPassword.fulfilled, (state, action) => {
            state.loading = false;
            state.forgotPasswordMessage = action.payload.statusText;
        })
            .addCase(authServices_1.forgotPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // confirm forgot password
            .addCase(authServices_1.confirmForgotPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(authServices_1.confirmForgotPassword.fulfilled, (state, action) => {
            state.loading = false;
            state.resetPasswordMessage = action.payload.message;
        })
            .addCase(authServices_1.confirmForgotPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // confirm signup
            .addCase(authServices_1.confirmSignUp.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(authServices_1.confirmSignUp.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
        })
            .addCase(authServices_1.confirmSignUp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            // get user
            .addCase(authServices_1.getUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(authServices_1.getUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        })
            .addCase(authServices_1.getUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
exports.updateSignup = authSlice.actions.updateSignup;
exports.default = authSlice.reducer;
