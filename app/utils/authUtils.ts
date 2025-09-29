import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import {
  LoginUser,
  LoginUserPrivilege,
  Privilege,
  PrivilegeAssignment,
  RoleAssignment,
  UserRbac,
} from '../types';

// Save access token to localStorage
export const saveToken = (token: string): null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('token', token);
  }
  return null;
};

// Get access token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('token');
  }
  return null;
};

// Clear access token from localStorage
export const clearToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Save refresh token to localStorage
export const saveRefreshToken = (refreshToken: string): null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  return null;
};

// Get refresh token from localStorage
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Clear refresh token from localStorage
export const clearRefreshToken = (): void => {
  localStorage.removeItem('refreshToken');
};

// Save encrypted user ID to localStorage
export const saveUserId = (userId: string): null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('userId', compressToEncodedURIComponent(userId));
  }
  return null;
};

// Get user ID from localStorage
export const getUserId = (): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const compressedUserId = localStorage.getItem('userId');
    if (compressedUserId) {
      return decompressFromEncodedURIComponent(compressedUserId);
    }
  }
  return null;
};

// Clear user ID from localStorage
export const clearUserId = (): void => {
  localStorage.removeItem('userId');
};

// Clear all authentication data (logout helper)
export const clearAuth = (): void => {
  clearToken();
  clearRefreshToken();
  clearUserId();
};

// Check user roles (RBAC utility)

// not sure what the uswr interface is
interface User {
  roles: string[];
}

export const hasRole = (
  user: User | null | undefined,
  requiredRoles: string[]
): boolean => {
  if (!user || !requiredRoles) return false;
  return requiredRoles.some(role => user.roles.includes(role));
};

export const getLoginUserId = (user: LoginUser | null) => {
  if (!user) {
    return null;
  }
  return user.id || null;
};

export const getUserAttributes = (
  user: LoginUser | null,
  name: string | string[]
): Record<string, string | null> | string | null => {
  if (
    !user ||
    !user.systemUserInfo ||
    !user.systemUserInfo.cognitoData ||
    !user.systemUserInfo.cognitoData.userAttributes
  ) {
    return null;
  }

  if (!Array.isArray(name)) {
    name = [name];
  }

  if (name.length === 0) {
    // If no names are provided, return all attributes
    const attributes: Record<string, string | null> = {};
    user.systemUserInfo.cognitoData.userAttributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });
    return attributes;
  }

  if (name.length === 1) {
    const attribute = user.systemUserInfo.cognitoData.userAttributes.find(
      attr => attr.Name === name[0]
    );
    return attribute ? attribute.Value : null;
  }

  // If multiple names are provided, return an object with all attributes
  const attributes: Record<string, string | null> = {};
  user.systemUserInfo.cognitoData.userAttributes.forEach(attr => {
    if (name.includes(attr.Name)) {
      attributes[attr.Name] = attr.Value;
    }
  });
  return attributes;
};

export const formatAPIResponse = (keyToRemove: string, response: any) => {
  if (keyToRemove === null || keyToRemove === undefined) {
    return response;
  }
  if (Array.isArray(response)) {
    return response.map(item => item[keyToRemove]);
  }
  return response;
};

export const getUserDisplayName = (userId: string, users: UserRbac[]) => {
  const cleanId = userId.replace('agentlang.auth$User/', '');
  const matchedUser = users.find(u => u.id === cleanId);

  if (!matchedUser) return cleanId;

  return matchedUser.firstName && matchedUser.lastName
    ? `${matchedUser.firstName} ${matchedUser.lastName}`
    : matchedUser.email || cleanId;
};

export function buildLoginUserPrivileges(
  user: UserRbac,
  roleAssignments: RoleAssignment[],
  privilegeAssignments: PrivilegeAssignment[],
  privileges: Privilege[]
): LoginUserPrivilege {
  const loginUserPrivileges: LoginUserPrivilege = {};

  // Step 1: find all roles assigned to the user
  const userRoles = roleAssignments
    .filter(ra => ra.User === `agentlang.auth$User/${user.id}`)
    .map(ra => ra.Role);

  // Step 2: find all privilegeAssignments for those roles
  const userPrivilegeAssignments = privilegeAssignments.filter(pa =>
    userRoles.includes(pa.Role)
  );

  // Step 3: link to privileges
  userPrivilegeAssignments.forEach(pa => {
    const privilege = privileges.find(
      p => pa.Permission === p.__path__ // match by ID suffix
    );
    if (privilege && privilege.resourceFqName) {
      // remove Resource/ prefix if present
      const resourceName = privilege.resourceFqName.replace(/^Resource\//, '');

      if (!loginUserPrivileges[resourceName]) {
        loginUserPrivileges[resourceName] = {
          c: privilege.c,
          r: privilege.r,
          u: privilege.u,
          d: privilege.d,
        };
      } else {
        // merge with existing permissions if already present
        loginUserPrivileges[resourceName] = {
          c: loginUserPrivileges[resourceName].c || privilege.c,
          r: loginUserPrivileges[resourceName].r || privilege.r,
          u: loginUserPrivileges[resourceName].u || privilege.u,
          d: loginUserPrivileges[resourceName].d || privilege.d,
        };
      }
    }
  });

  return loginUserPrivileges;
}
