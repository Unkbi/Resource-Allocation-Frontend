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
    HRLevel: newData.HRLevel,
    WorkLocation: newData.WorkLocation,
    HourlyRate: newData.HourlyRate,
    ValidityStartDate: newData.ValidityStartDate,
    ValidityEndDate: newData.ValidityEndDate,
    HourlyRateCurrency: newData.HourlyRateCurrency,
    Status: newData.Status,
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
    HRLevel: updatedFields.HRLevel,
    WorkLocation: updatedFields.WorkLocation,
    HourlyRate: updatedFields.HourlyRate,
    ValidityStartDate: updatedFields.ValidityStartDate,
    ValidityEndDate: updatedFields.ValidityEndDate,
    HourlyRateCurrency: updatedFields.HourlyRateCurrency,
    Status: updatedFields.Status,
  };
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/EmployeeRate/${rateId}`,
    payload
  );
  return response.data;
};

export const deleteEmployeeRates = async (rateId: string,hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/EmployeeRate/${rateId}`,
    {
      params : {hardDelete} ,
    }
  );
  return response.data;
};