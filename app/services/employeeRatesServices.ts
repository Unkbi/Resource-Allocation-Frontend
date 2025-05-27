import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchEmployeeRates = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/EmployeeRate`
  );
  return response.data;
};
