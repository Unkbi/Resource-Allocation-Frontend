import { API_AGENTLANG_KERNEL_RBAC } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

/*
 * Role
 */
export const fetchRoles = async () => {
  const response = await axiosInstance.get(`${API_AGENTLANG_KERNEL_RBAC}/Role`);
  return response.data;
};

export const createRole = async (newData: any) => {
  const payload = {
    name: newData.name,
  };
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/Role`,
    payload
  );
  return response.data;
};

export const deleteRole = async (Name: string) => {
  const response = await axiosInstance.delete(
    `${API_AGENTLANG_KERNEL_RBAC}/Role/${Name}`
  );
  return response.data;
};

/*
 * RoleAssignment
 */
export const fetchRoleAssignments = async () => {
  const response = await axiosInstance.get(
    `${API_AGENTLANG_KERNEL_RBAC}/RoleAssignment`
  );
  return response.data;
};

export const createRoleAssignment = async (newData: any) => {
  const payload = {
   userId: newData.Name,
   roleName: newData.Role,
  };
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/AssignUserToRole`,
    payload
  );
  return response.data;
};

export const deleteRoleAssignment = async (Name: string) => {
  const response = await axiosInstance.delete(
    `${API_AGENTLANG_KERNEL_RBAC}/RoleAssignment/${Name}`
  );
  return response.data;
};

/*
 * Privilege
 */
export const fetchPrivileges = async () => {
  const response = await axiosInstance.get(
    `${API_AGENTLANG_KERNEL_RBAC}/Permission`
  );
  return response.data;
};

export const createPrivilege = async (newData: any) => {
  const payload = {
    id: newData.id,
    resourceFqName: newData.resourceFqName,
    c: newData.c,
    r: newData.r,
    u: newData.u,
    d: newData.d,
  };
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/Permission`,
    payload
  );
  return response.data;
};

export const updatePrivilege = async (id: string, updatedFields: any) => {
  const payload = {
   ...updatedFields
  };
  const response = await axiosInstance.put(
    `${API_AGENTLANG_KERNEL_RBAC}/Permission/${id}`,
    payload
  );
  return  response.data[0];
};


export const deletePrivilege = async (id: string) => {
  const response = await axiosInstance.delete(
    `${API_AGENTLANG_KERNEL_RBAC}/Permission/${id}`
  );
  return response.data;
};

/*
 * PrivilegeAssignment
 */
export const fetchPrivilegeAssignments = async () => {
  const response = await axiosInstance.get(
    `${API_AGENTLANG_KERNEL_RBAC}/PrivilegeAssignment`
  );
  return response.data;
};

export const createPrivilegeAssignment = async (newData: any) => {
  const payload = {
    'Agentlang.Kernel.Rbac/PrivilegeAssignment': newData,
  };
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/PrivilegeAssignment`,
    payload
  );
  return response.data;
};

export const updatePrivilegeAssignment = async (
  Name: string,
  updatedFields: any
) => {
  const payload = {
    'Agentlang.Kernel.Rbac/PrivilegeAssignment': updatedFields,
  };
  const response = await axiosInstance.put(
    `${API_AGENTLANG_KERNEL_RBAC}/PrivilegeAssignment/${Name}`,
    payload
  );
  return response.data;
};

export const deletePrivilegeAssignment = async (Name: string) => {
  const response = await axiosInstance.delete(
    `${API_AGENTLANG_KERNEL_RBAC}/PrivilegeAssignment/${Name}`
  );
  return response.data;
};

/*
 *  Entities
 */
export const fetchEntities = async () => {
  const response = await axiosInstance.get(`/meta/ResourceAllocation.Core`);
  return response.data;
};

export const fetchUser = async () => {
  const response = await axiosInstance.get(`${API_AGENTLANG_KERNEL_RBAC}/User`);
  return response.data;
}
