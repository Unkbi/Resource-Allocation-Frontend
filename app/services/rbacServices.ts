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

export const deleteRole = async (Name: string, hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_AGENTLANG_KERNEL_RBAC}/Role/${Name}`,
    {
      params: { purge: hardDelete }
    }
  );
  return response.data;
};

/*
 * RoleAssignment
 */
export const fetchRoleAssignments = async () => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/ListUserRoles`
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

export const updateRoleAssigment = async (updatedFields: any) => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/UpdateRoleAssignment`,
    updatedFields
  );
  return response.data;
}


export const deleteRoleAssignment = async (User :string , Role:string) => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/DeleteUserRole`,
    {
      User,
      Role,
    }
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


export const deletePrivilege = async (id: string, hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_AGENTLANG_KERNEL_RBAC}/Permission/${id}`,
    { params: { purge: hardDelete } }
  );
  return response.data;
};

/*
 * PrivilegeAssignment
 */
export const fetchPrivilegeAssignments = async () => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/ListRolePermissions`
  );
  return response.data;
};

export const createPrivilegeAssignment = async (newData: any) => {
   const payload = {
   roleName: newData.Role,
   permissionId: newData.Permission,
  };
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/AddPermissionToRole`,
    payload
  );
  return response.data;
};

export const updatePrivilegeAssignment = async (updatedFields: any) => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/UpdatePermissionAssignment`,
    updatedFields
  );
  return response.data;
};

export const deletePrivilegeAssignment = async (Role :string , Permission :string) => {
  const response = await axiosInstance.post(
    `${API_AGENTLANG_KERNEL_RBAC}/DeleteRolePermission`,
    { Role, Permission }
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

export const fetchMeta = async () => {
  const response = await axiosInstance.get(`/meta`);
  return response.data;
}
