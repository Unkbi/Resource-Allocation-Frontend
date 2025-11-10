import { API_AGENTLANG_KERNEL_RBAC } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

const RESOURCE_MOCK_DATA = [
  {
    Resource: {
      id: 'r1',
      Name: 'Emily Carter',
      email: 'jane.doe@company.com',
      accessLevel: 'Admin',
      location: 'Los Angeles, USA',
      resourceStatus: 'Active',
      userStatus: 'Active',
    }
  },
  {
    Resource: {
      id: 'r2',
      Name: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      accessLevel: 'Allocation Manager',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Not Created',
    }
  },
  {
    Resource: {
      id: 'r3',
      Name: 'Samantha Lee',
      email: 'samantha.lee@company.com',
      accessLevel: 'Allocation Manager',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Not Created',
    }
  },
  {
    Resource: {
      id: 'r4',
      Name: 'Michael Thompson',
      email: 'michael.thompson@company.com',
      accessLevel: 'General User',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Invited',
    }
  },
  {
    Resource:
    {
      id: 'r5',
      Name: 'Jessica Taylor',
      email: 'jessica.taylor@company.com',
      accessLevel: 'Allocation Manager',
      location: 'Chicago, USA',
      resourceStatus: 'Active',
      userStatus: 'Inactive',
    }
  },
];

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
    `${API_AGENTLANG_KERNEL_RBAC}/inviteUser`,
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
  // Simulate API delay for realistic behavior
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return mock data
  return RESOURCE_MOCK_DATA;
  // When API is ready, uncomment below:
  // const response = await axiosInstance.get(
  //   `${API_PROJECT_PORTFOLIO}/Resource`
  // );
  // return response.data;
};

