import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchProjectTypes = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/ProjectType`
  );
  return response.data;
};

export const fetchProjectTypeGroups = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/ProjectTypeGroup`
  );
  return response.data;
};

export const addProjectType = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/ProjectType`,
    postData
  );
  return response.data;
};

export const updateProjectType = async (postData: any, id: string) => {
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/ProjectType/${id}`,
    postData
  );
  return response.data;
};

export const deleteProjectType = async (id: string,hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/ProjectType/${id}`,
    {
       params: { purge: hardDelete },
    }
  );
  return response.data;
};

export const addProjectTypeGroups = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/ProjectTypeGroup`,
    postData
  );
  return response.data;
};

export const updateProjectTypeGroups = async (postData: any, id: string) => {
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/ProjectTypeGroup/${id}`,
    postData
  );
  return response.data;
};

export const deleteProjectTypeGroups = async (id: string,hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/ProjectTypeGroup/${id}`,
    {
      params: { purge: hardDelete },
    } 
  );
  return response.data;
};
