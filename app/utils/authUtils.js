// Save access token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Get access token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Clear access token from localStorage
export const clearToken = () => {
  localStorage.removeItem('token');
};

// Save refresh token to localStorage
export const saveRefreshToken = (refreshToken) => {
  localStorage.setItem('refreshToken', refreshToken);
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Clear refresh token from localStorage
export const clearRefreshToken = () => {
  localStorage.removeItem('refreshToken');
};

// Clear all authentication data (logout helper)
export const clearAuth = () => {
  clearToken();
  clearRefreshToken();
};

// Check user roles (RBAC utility)
export const hasRole = (user, requiredRoles) => {
  if (!user || !requiredRoles) return false;
  return requiredRoles.some((role) => user.roles.includes(role));
};
