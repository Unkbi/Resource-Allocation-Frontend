import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchEmployeeRates = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/EmployeeRate`
  );
  return response.data;
};

export const createEmployeeRates = async (newData: any) => {
  const payload = {
    'ResourceAllocation.Core/EmployeeRate': newData,
  };
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/EmployeeRate`,
    payload
  );
  return response.data;
};

export const updateEmployeeRates = async (
  rateId: string,
  updatedFields: any
) => {
  const payload = {
    'ResourceAllocation.Core/EmployeeRate': updatedFields,
  };
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/EmployeeRate/${rateId}`,
    payload
  );
  return response.data;
};

export const deleteEmployeeRates = async (rateId: string) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/EmployeeRate/${rateId}`
  );
  return response.data;
};