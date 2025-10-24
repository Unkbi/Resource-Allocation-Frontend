import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchLocation = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/WorkLocation`
  );
  return response.data;
};

export const fetchLocationGroups = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/WorkLocationGroup`
  );
  return response.data;
};

export const addLocation = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/WorkLocation`,
    postData
  );
  return response.data;
};

export const updateLocation = async (postData: any, id: string) => {
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/WorkLocation/${id}`,
    postData
  );
  return response.data;
};

export const deleteLocation = async (id: string, hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/WorkLocation/${id}`,
    {
       params: { purge: hardDelete },
    }
  );
  return response.data;
};

export const addLocationGroups = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/WorkLocationGroup`,
    postData
  );
  return response.data;
};

export const updateLocationGroups = async (postData: any, id: string) => {
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/WorkLocationGroup/${id}`,
    postData
  );
  return response.data;
};

export const deleteLocationGroups = async (id: string, hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/WorkLocationGroup/${id}`,
    {
      params: { purge: hardDelete },
    } 
  );
  return response.data;
};
