"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRole = exports.clearAuth = exports.clearRefreshToken = exports.getRefreshToken = exports.saveRefreshToken = exports.clearToken = exports.getToken = exports.saveToken = void 0;
// Save access token to localStorage
const saveToken = (token) => {
    if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem('token', token);
    }
    return null;
};
exports.saveToken = saveToken;
// Get access token from localStorage
const getToken = () => {
    if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem("token");
    }
    return null;
};
exports.getToken = getToken;
// Clear access token from localStorage
const clearToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};
exports.clearToken = clearToken;
// Save refresh token to localStorage
const saveRefreshToken = (refreshToken) => {
    if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem('refreshToken', refreshToken);
    }
    return null;
};
exports.saveRefreshToken = saveRefreshToken;
// Get refresh token from localStorage
const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};
exports.getRefreshToken = getRefreshToken;
// Clear refresh token from localStorage
const clearRefreshToken = () => {
    localStorage.removeItem('refreshToken');
};
exports.clearRefreshToken = clearRefreshToken;
// Clear all authentication data (logout helper)
const clearAuth = () => {
    (0, exports.clearToken)();
    (0, exports.clearRefreshToken)();
};
exports.clearAuth = clearAuth;
// Check user roles (RBAC utility)
const hasRole = (user, requiredRoles) => {
    if (!user || !requiredRoles)
        return false;
    return requiredRoles.some((role) => user.roles.includes(role));
};
exports.hasRole = hasRole;
