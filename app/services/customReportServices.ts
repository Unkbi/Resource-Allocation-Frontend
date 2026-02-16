import { CustomReportResponse, CustomReportFilters } from '@/app/types/customReportTypes';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

// Service function to fetch custom report
export const fetchCustomReport = async (filters: CustomReportFilters): Promise<CustomReportResponse> => {

  const response = await axiosInstance.post(  
    `${API_PROJECT_PORTFOLIO}/GetAllProjectsAllocationsByType`,
    filters
  );
  return response.data;
};
