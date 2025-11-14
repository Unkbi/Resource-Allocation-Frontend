import { API_AGENTLANG_KERNEL_RBAC, API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

// Fetch users from API
export const fetchUser = async () => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/getUsersDetail`
  );
  return response.data;
};

export const addUser = async (postData: any) => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/CreateUsers`,
    postData
  );
  return response.data;
};

export const updateUser = async (postData: any, id: string) => {
  const response = await axiosInstance.put(
    `${API_AGENTLANG_KERNEL_RBAC}/User/${id}`,
    postData
  );
  return response.data;
};

export const deleteUser = async (id: string, hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_AGENTLANG_KERNEL_RBAC}/User/${id}`,
    {
      params: { purge: hardDelete },
    }
  );
  return response.data;
};

export const sendInvite = async (userData: any) => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/inviteUsers`,
    userData
  );
  return response.data;
};

export const resendInvite = async (userData: any) => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/resendInvitation`,
    userData
  );
  return response.data;
};

export const deactivateUser = async (userData: any) => {
  console.log('Deactivating user with data:', userData);
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/inactivateUser`,
    userData
  );
  return response.data;
};

export const activateUser = async (userData: any) => {
  console.log('Activating user with data:', userData);
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/activateUser`,
    userData
  );
  return response.data;
};

export const fetchUserResource = async () => {
  
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/Resource?@leftJoinOn=UserId`
  );
  return response.data;
};

