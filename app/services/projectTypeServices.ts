import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchProjectTypes = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/ProjectType`
  );
  return response.data;
};
