import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

export const fetchUser = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/User`
  );
  return response.data;
};

export const addUser = async (postData: any) => {
  const response = await axiosInstance.post(
    `/agentlang.auth/CreateUsers`,
    postData
  );
  return response.data;
};

export const updateUser = async (postData: any, id: string) => {
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/User/${id}`,
    postData
  );
  return response.data;
};

export const deleteUser = async (id: string, hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/User/${id}`,
    {
       params: { purge: hardDelete },
    }
  );
  return response.data;
};

export const sendInvite = async (userData: any) => {
  const response = await axiosInstance.post(
    `/agentlang.auth/inviteUser`,
    userData
  );
  return response.data;
};
