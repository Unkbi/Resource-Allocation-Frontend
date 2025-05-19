import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchAllOrganisations = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/Organization`
  );
  return response.data;
};
