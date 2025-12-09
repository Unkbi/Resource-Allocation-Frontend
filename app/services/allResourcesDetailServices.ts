import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchAllResourcesDetail = async () => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetAllResourcesDetail`,
    {}
  );
  return response.data;
};

export const fetchResourceDetails = async (queryParams: any) => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/Resource`,
    {
      params: { ...queryParams },
    }
  );
  return response.data;
};
