"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResourceAllocations = exports.putResourceAllocations = exports.postResourceAllocations = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const apiClient_1 = __importDefault(require("../utils/apiClient"));
const constants_1 = require("../constants/constants");
exports.postResourceAllocations = (0, toolkit_1.createAsyncThunk)('/allocations/post', async (params, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.post(`${constants_1.API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation`, params.postData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to set resource allocation');
    }
});
exports.putResourceAllocations = (0, toolkit_1.createAsyncThunk)('/allocations/put', async (params, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.put(`${constants_1.API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`, params.putData);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to set resource allocation');
    }
});
exports.deleteResourceAllocations = (0, toolkit_1.createAsyncThunk)('/allocations/delete', async (params, { rejectWithValue }) => {
    try {
        const response = await apiClient_1.default.delete(`${constants_1.API_PROJECT_PORTFOLIO}/Resource/${params.resourceId}/ResourceAllocation/Allocation/${params.allocationId}`);
        return response.data;
    }
    catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to delete resource allocation');
    }
});
