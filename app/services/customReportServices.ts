import { CustomReportResponse, CustomReportFilters } from '@/app/types/customReportTypes';
import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

// Service function to fetch custom report (Percentage Allocation)
export const fetchCustomReport = async (filters: CustomReportFilters): Promise<CustomReportResponse> => {

  const response = await axiosInstance.post(  
    `${API_PROJECT_PORTFOLIO}/GetAllProjectsAllocationsByType`,
    filters
  );
  return response.data;
};

// Service function to fetch allocation capacity report
export const fetchAllocationCapacityReport = async (filters: any): Promise<any> => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetWeeklyProjectsAllocationsCapacityByType`,
    filters
  );
  return response.data;
};
