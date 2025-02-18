import axios from 'axios';
import {
  getToken,
  getRefreshToken,
  saveToken,
  clearAuth,
  saveRefreshToken,
} from './authUtils';

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
const MAX_RETRIES = 3;
const axiosInstance = axios.create({
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

axiosInstance.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      // console.log('originalRequest._retry34',config)
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (!error.response) {
      console.error('No response received from API', error);
      return Promise.reject(error);
    }

    console.log(
      'Interceptor caught error:',
      error.response.status,
      error.response.data
    );

    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      console.log('401 detected, handling token refresh...');
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount > MAX_RETRIES) {
        console.error('Max retry attempts reached. Logging out.');
        // clearAuth();
        return Promise.reject(new Error('Max retry attempts reached'));
      }

      if (isRefreshing) {
        return new Promise(resolve => {
          addRefreshSubscriber(newToken => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        console.log('Using refresh token:', refreshToken);

        if (!refreshToken) {
          console.log('No refresh token found, logging out.');
          // clearAuth();
          return Promise.reject(error);
        }

        const response = await axios.post(`${apiBaseURL}/refresh-token`, {
          'Agentlang.Kernel.Identity/RefreshToken': {
            RefreshToken: refreshToken,
          },
        });

        const data = response?.data?.result['authentication-result'];
        const newToken = data['id-token'];
        const newRefreshToken = data['refresh-token'];

        if (newRefreshToken) {
          saveRefreshToken(newRefreshToken);
        }

        saveToken(newToken);
        isRefreshing = false;
        onTokenRefreshed(newToken);

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
