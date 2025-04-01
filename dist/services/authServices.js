"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmForgotPassword = exports.forgotPassword = exports.logoutUser = exports.confirmSignUp = exports.signupUser = exports.getUser = exports.loginUser = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const apiClient_1 = __importDefault(require("../utils/apiClient"));
const authUtils_1 = require("../utils/authUtils");
// Login User
exports.loginUser = (0, toolkit_1.createAsyncThunk)('auth/loginUser', async (credentials, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post('/login', credentials);
        const data = response.data.result['authentication-result'];
        (0, authUtils_1.saveToken)(data['id-token']);
        (0, authUtils_1.saveRefreshToken)(data['refresh-token']);
        return data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.reason || 'Login failed');
    }
});
// Get User
exports.getUser = (0, toolkit_1.createAsyncThunk)('auth/getUser', async () => {
    try {
        const response = await apiClient_1.default.post('/get-user');
        return response.data.result;
    }
    catch (error) {
        return 'User not found';
    }
});
exports.signupUser = (0, toolkit_1.createAsyncThunk)('auth/signupUser', async (data, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post('/signup', data);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.reason || 'Signup failed');
    }
});
exports.confirmSignUp = (0, toolkit_1.createAsyncThunk)('auth/confirmSignUp', async (data, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post('/confirm-sign-up', data);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.reason || 'Signup failed');
    }
});
// Logout User
exports.logoutUser = (0, toolkit_1.createAsyncThunk)('auth/logoutUser', async () => {
    (0, authUtils_1.clearToken)();
    return;
});
exports.forgotPassword = (0, toolkit_1.createAsyncThunk)('auth/forgotPassword', async (data, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post('/forgot-password', data);
        return response;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.reason || 'Failed to send reset link');
    }
});
exports.confirmForgotPassword = (0, toolkit_1.createAsyncThunk)('auth/confirmForgotPassword', async (data, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post('/confirm-forgot-password', data);
        return response.data.message;
    }
    catch (error) {
        return rejectWithValue(error.response?.data?.reason || 'Failed to reset password');
    }
});
