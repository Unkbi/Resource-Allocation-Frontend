// Save access token to localStorage
export const saveToken = (token: string): null => {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem('token', token);
  }
    return null;
};

// Get access token from localStorage
export const getToken = (): string | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("token");
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
  if (typeof window !== "undefined" && window.localStorage) {
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

// Clear all authentication data (logout helper)
export const clearAuth = (): void => {
  clearToken();
  clearRefreshToken();
};

// Check user roles (RBAC utility)

// not sure what the uswr interface is
interface User {
  roles: string[];
}

export const hasRole = (user: User | null | undefined, requiredRoles: string []): boolean => {
  if (!user || !requiredRoles) return false;
  return requiredRoles.some((role) => user.roles.includes(role));
};
