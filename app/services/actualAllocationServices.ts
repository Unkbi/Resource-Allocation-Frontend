import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { ActualAllocationsForPeriodPayload } from '../types';
import axiosInstance from '../utils/apiClient';

export const fetchActualAllocationsForPeriod = async (
  postData: ActualAllocationsForPeriodPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetActualizedAllocationsByPeriod`,
    postData
  );
  return response.data;
};
