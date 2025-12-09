import { RBACState } from '@/app/types';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState: RBACState = {
  user: null,
  loginUserPrivileges: null,
  roles: [],
  roleAssignments: [],
  privileges: [],
  privilegeAssignments: [],
  meta: null,
  dashboardQueryKeys: [],
  loading: true,
  loadingLoginUserPrivileges: true,
  rolesLoading: true,
  roleAssignmentsLoading: true,
  privilegesLoading: true,
  privilegeAssignmentsLoading: true,
  dashboardQueryKeysLoading: true,
  error: false,
};

const rbacSlice = createSlice({
  name: 'RBAC',
  initialState,
  reducers: {
    setLoginUserPrivileges: (state, action) => {
      state.loginUserPrivileges = action.payload;
    },
    setRoles: (state, action) => {
      state.roles = formatAPIResponse('Role', action.payload);
    },
    clearRoles: state => {
      state.roles = [];
    },
    updateRoles: (state, action) => {
      const updatedRoles = action.payload;
      if (!state.roles) return;
      const index = state.roles.findIndex(
        role => role.name === updatedRoles.Name
      );
      if (index !== -1) {
        state.roles[index] = {
          ...state.roles[index],
          ...updatedRoles,
        };
      }
    },
    setRoleAssignments: (state, action) => {
      const normalized = action.payload.map((item: any) =>
        item.UserRole ? item.UserRole : item
      );
      state.roleAssignments = normalized;
    },
    clearRoleAssignments: state => {
      state.roleAssignments = [];
    },
    updateRoleAssignments: (state, action) => {
      const updatedRoleAssignment = action.payload;
      if (!state.roleAssignments) return;
      const index = state.roleAssignments.findIndex(
        assignment => assignment.Role === updatedRoleAssignment.Role
      );
      if (index !== -1) {
        state.roleAssignments[index] = {
          ...state.roleAssignments[index],
          ...updatedRoleAssignment,
        };
      }
    },
    setPrivileges: (state, action) => {
      state.privileges = formatAPIResponse('Permission', action.payload);
    },
    clearPrivileges: state => {
      state.privileges = [];
    },
    updatePrivileges: (state, action) => {
      const updatedPrivilege = action.payload;
      if (!state.privileges) return;
      const index = state.privileges.findIndex(
        privilege => privilege.id === updatedPrivilege.id
      );
      if (index !== -1) {
        state.privileges[index] = {
          ...state.privileges[index],
          ...updatedPrivilege,
        };
      }
    },
    setPrivilegeAssignments: (state, action) => {
      const normalized = action.payload.map((item: any) =>
        item.RolePermission ? item.RolePermission : item
      );
      state.privilegeAssignments = normalized;
    },
    clearPrivilegeAssignments: state => {
      state.privilegeAssignments = [];
    },
    updatePrivilegeAssignments: (state, action) => {
      const updatedPrivilegeAssignment = action.payload;
      if (!state.privilegeAssignments) return;
      const index = state.privilegeAssignments.findIndex(
        assignment =>
          assignment.__path__ === updatedPrivilegeAssignment.__path__
      );
      if (index !== -1) {
        state.privilegeAssignments[index] = {
          ...state.privilegeAssignments[index],
          ...updatedPrivilegeAssignment,
        };
      }
    },
    setMeta: (state, action) => {
      state.meta = action.payload;
    },
    setDashboardQueryKeys: (state, action) => {
      state.dashboardQueryKeys = formatAPIResponse('QueryKey', action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoadingLoginUserPrivileges: (state, action) => {
      state.loadingLoginUserPrivileges = action.payload;
    },
    setRolesLoading: (state, action) => {
      state.rolesLoading = action.payload;
    },
    setRoleAssignmentsLoading: (state, action) => {
      state.roleAssignmentsLoading = action.payload;
    },
    setPrivilegesLoading: (state, action) => {
      state.privilegesLoading = action.payload;
    },
    setPrivilegeAssignmentsLoading: (state, action) => {
      state.privilegeAssignmentsLoading = action.payload;
    },
    setDashboardQueryKeysLoading: (state, action) => {
      state.dashboardQueryKeysLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setUser: (state, action) => {
      state.user = formatAPIResponse('User', action.payload);
    },
  },
});

export const {
  setLoginUserPrivileges,
  setRoles,
  clearRoles,
  updateRoles,
  setRoleAssignments,
  clearRoleAssignments,
  updateRoleAssignments,
  setPrivileges,
  clearPrivileges,
  updatePrivileges,
  setPrivilegeAssignments,
  clearPrivilegeAssignments,
  updatePrivilegeAssignments,
  setLoading,
  setLoadingLoginUserPrivileges,
  setRolesLoading,
  setRoleAssignmentsLoading,
  setPrivilegesLoading,
  setPrivilegeAssignmentsLoading,
  setError,
  setUser,
  setMeta,
  setDashboardQueryKeys,
  setDashboardQueryKeysLoading,
} = rbacSlice.actions;
export default rbacSlice.reducer;
