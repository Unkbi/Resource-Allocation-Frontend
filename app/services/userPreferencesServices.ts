import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchUserPreferences = async (userId: string) => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/UserPreferences?User=${userId}`
  );
  return response.data;
};

export const addUserPreference = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/SetUserPreference`,
    postData
  );
  return response.data;
};

export const updateUserPreference = async (postData: any) => {
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/UserPreferences/${postData?.Key}`,
    postData
  );
  return response.data;
};

export const setUserPreferenceAPI = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/SetUserPreference`,
    postData
  );
  return response.data;
};
