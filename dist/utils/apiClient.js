"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const authUtils_1 = require("./authUtils");
const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const MAX_RETRIES = 3;
const axiosInstance = axios_1.default.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});
let isRefreshing = false;
let refreshSubscribers = [];
const onTokenRefreshed = newToken => {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
};
const addRefreshSubscriber = callback => {
    refreshSubscribers.push(callback);
};
axiosInstance.interceptors.request.use(config => {
    const token = (0, authUtils_1.getToken)();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));
axiosInstance.interceptors.response.use(response => response, async (error) => {
    if (!error.response) {
        console.error('No response received from API', error);
        return Promise.reject(error);
    }
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        if (originalRequest._retryCount > MAX_RETRIES) {
            (0, authUtils_1.clearAuth)();
            return Promise.reject(new Error('Max retry attempts reached'));
        }
        if (isRefreshing) {
            return new Promise(resolve => {
                addRefreshSubscriber(newToken => {
                    originalRequest.headers['Authorization'] = newToken;
                    resolve(axiosInstance(originalRequest));
                });
            });
        }
        isRefreshing = true;
        try {
            const refreshToken = (0, authUtils_1.getRefreshToken)();
            if (!refreshToken) {
                (0, authUtils_1.clearAuth)();
                return Promise.reject(error);
            }
            const response = await axios_1.default.post(`${apiBaseURL}/refresh-token`, {
                'Agentlang.Kernel.Identity/RefreshToken': {
                    RefreshToken: refreshToken,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${(0, authUtils_1.getToken)()}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = response?.data?.result['authentication-result'];
            const newToken = data['id-token'];
            const newRefreshToken = data['refresh-token'];
            if (newRefreshToken) {
                (0, authUtils_1.saveRefreshToken)(newRefreshToken);
            }
            (0, authUtils_1.saveToken)(newToken);
            isRefreshing = false;
            onTokenRefreshed(newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
        }
        catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            (0, authUtils_1.clearAuth)();
            return Promise.reject(refreshError);
        }
        finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
});
exports.default = axiosInstance;
