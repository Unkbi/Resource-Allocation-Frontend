import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchAllSystemSettings = async () => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetAllSystemSettings`
  );
  return response.data;
};

export const fetchScalarSettings = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/ScalarSetting`
  );
  return response.data;
};

export const addScalarSettings = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/ScalarSetting`,
    postData
  );
  return response.data;
};

export const updateScalarSetting = async (postData: any) => {
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/ScalarSetting/${postData?.SettingKey}`,
    postData
  );
  return response.data;
};
