"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectAllocations = exports.deleteProject = exports.updateProject = exports.addProject = exports.getAllProjects = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const apiClient_1 = __importDefault(require("../utils/apiClient"));
const constants_1 = require("../constants/constants");
exports.getAllProjects = (0, toolkit_1.createAsyncThunk)('/project', async () => {
    const response = await apiClient_1.default.get(`${constants_1.API_PROJECT_PORTFOLIO}/Project`);
    return response.data;
});
exports.addProject = (0, toolkit_1.createAsyncThunk)('/project/add', async (postData, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post(`${constants_1.API_PROJECT_PORTFOLIO}/Project`, postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to add project');
    }
});
exports.updateProject = (0, toolkit_1.createAsyncThunk)('/project/update', async ({ postData, projectId }, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.put(`${constants_1.API_PROJECT_PORTFOLIO}/Project/${projectId}`, postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to update project');
    }
});
exports.deleteProject = (0, toolkit_1.createAsyncThunk)('/project/delete', async (projectId, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.delete(`${constants_1.API_PROJECT_PORTFOLIO}/Project/${projectId}`);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to delete project');
    }
});
exports.getProjectAllocations = (0, toolkit_1.createAsyncThunk)('/project/allocations', async (postData, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post(`${constants_1.API_PROJECT_PORTFOLIO}/GetProjectAllocationsForPeriod`, postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch allocations');
    }
});
