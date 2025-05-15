import axiosInstance from '../utils/apiClient';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { GetAllCostForPeriodPayload } from '../types/allocationTypesCost';

export const fetchAllAllocationCosts = async (
  postData: GetAllCostForPeriodPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetAllAllocationsForPeriod`,
    postData
  );
  return response.data;
};
