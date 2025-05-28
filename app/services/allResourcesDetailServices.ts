import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchAllResourcesDetail = async () => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetAllResourcesDetail`,
    {
      'ResourceAllocation.Core/GetAllResourcesDetail': {},
    }
  );
  return response.data;
};
