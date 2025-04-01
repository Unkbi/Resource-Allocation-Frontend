"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTeamResource = exports.getTeamAllocations = exports.getAllAllocationsForPeriod = exports.getResourcesAgainstTeams = exports.getAllTeams = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const apiClient_1 = __importDefault(require("../utils/apiClient"));
const constants_1 = require("../constants/constants");
exports.getAllTeams = (0, toolkit_1.createAsyncThunk)('/team', async () => {
    const response = await apiClient_1.default.get(`${constants_1.API_PROJECT_PORTFOLIO}/Team`);
    return response.data;
});
exports.getResourcesAgainstTeams = (0, toolkit_1.createAsyncThunk)('/team/resources', async (postData, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post(`${constants_1.API_PROJECT_PORTFOLIO}/GetTeamResources`, postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch teams resources.');
    }
});
exports.getAllAllocationsForPeriod = (0, toolkit_1.createAsyncThunk)('team/allAllocations', async (postData, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post(`${constants_1.API_PROJECT_PORTFOLIO}/GetAllAllocationsForPeriod`, postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch all allocations');
    }
});
exports.getTeamAllocations = (0, toolkit_1.createAsyncThunk)('team/allocations', async (postData, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post(`${constants_1.API_PROJECT_PORTFOLIO}/GetTeamAllocationsForPeriod`, postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to fetch team allocations');
    }
});
exports.postTeamResource = (0, toolkit_1.createAsyncThunk)('team/addResource', async (postData, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post(`${constants_1.API_PROJECT_PORTFOLIO}/TeamResource`, postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to add resource to team');
    }
});
