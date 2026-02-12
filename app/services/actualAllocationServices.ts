import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import {
  ActualAllocationsForPeriodPayload,
  ConfirmActualAllocationsForPeriodRequest,
  UpdateActualStatusForPeriodPayload,
} from '../types';
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

export const fetchActualStatusForPeriod = async (
  postData: ActualAllocationsForPeriodPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetActualStatus`,
    postData
  );
  return response.data;
};

export const updateActualStatusForPeriod = async (
  postData: UpdateActualStatusForPeriodPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/UpdateActualsStatus`,
    postData
  );
  return response.data;
};

export const confirmActualsEnteredForPeriod = async (
  postData: ConfirmActualAllocationsForPeriodRequest
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/ConfirmActualsEntered`,
    postData
  );
  return response.data;
};
