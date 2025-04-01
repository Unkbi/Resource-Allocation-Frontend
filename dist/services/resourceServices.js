"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllResources = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const apiClient_1 = __importDefault(require("../utils/apiClient"));
const constants_1 = require("../constants/constants");
exports.getAllResources = (0, toolkit_1.createAsyncThunk)('/resource', async () => {
    const response = await apiClient_1.default.get(`${constants_1.API_PROJECT_PORTFOLIO}/Resource`);
    return response.data;
});
