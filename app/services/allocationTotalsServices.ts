import { API_PROJECT_PORTFOLIO } from "../constants/constants";
import axiosInstance from "../utils/apiClient";


export interface AllocationTotalsPayload {
  Project?: string[];
  StartDate?: string; 
  EndDate?: string;  
  Status?: string[];
}

export const fetchTotalAllocations = async (payload: AllocationTotalsPayload) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetTotalAllocations`,
    payload
  );
  return response.data;
};

export const fetchTotalAllocationTillDate = async (payload: AllocationTotalsPayload) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/TotalAllocationTillDate`,
    payload
  );
  return response.data;
};

export const fetchTotalAllocationCosts = async (payload: AllocationTotalsPayload) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetTotalAllocationCost`,
    payload
  );
  return response.data;
};

export const fetchTotalAllocationsSummary = async (payload: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetTotalAllocationsSummary`,
    payload
  );
  return response.data;
};

