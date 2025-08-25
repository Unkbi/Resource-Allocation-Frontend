import { RBACState } from '@/app/types';
import { formatAPIResponse } from '@/app/utils/authUtils';
import { createSlice } from '@reduxjs/toolkit';

const initialState: RBACState = {
  roles: [],
  roleAssignments: [],
  privileges: [],
  privilegeAssignments: [],
  loading: true,
  error: false,
};

const rbacSlice = createSlice({
  name: 'RBAC',
  initialState,
  reducers: {
    setRoles: (state, action) => {
      state.roles = formatAPIResponse('Role',action.payload);
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
      state.roleAssignments = action.payload;
    },
    clearRoleAssignments: state => {
      state.roleAssignments = [];
    },
    updateRoleAssignments: (state, action) => {
      const updatedRoleAssignment = action.payload;
      if (!state.roleAssignments) return;
      const index = state.roleAssignments.findIndex(
        assignment => assignment.Name === updatedRoleAssignment.Name
      );
      if (index !== -1) {
        state.roleAssignments[index] = {
          ...state.roleAssignments[index],
          ...updatedRoleAssignment,
        };
      }
    },
    setPrivileges: (state, action) => {
      state.privileges = action.payload;
    },
    clearPrivileges: state => {
      state.privileges = [];
    },
    updatePrivileges: (state, action) => {
      const updatedPrivilege = action.payload;
      if (!state.privileges) return;
      const index = state.privileges.findIndex(
        privilege => privilege.Name === updatedPrivilege.Name
      );
      if (index !== -1) {
        state.privileges[index] = {
          ...state.privileges[index],
          ...updatedPrivilege,
        };
      }
    },
    setPrivilegeAssignments: (state, action) => {
      state.privilegeAssignments = action.payload;
    },
    clearPrivilegeAssignments: state => {
      state.privilegeAssignments = [];
    },
    updatePrivilegeAssignments: (state, action) => {
      const updatedPrivilegeAssignment = action.payload;
      if (!state.privilegeAssignments) return;
      const index = state.privilegeAssignments.findIndex(
        assignment => assignment.Name === updatedPrivilegeAssignment.Name
      );
      if (index !== -1) {
        state.privilegeAssignments[index] = {
          ...state.privilegeAssignments[index],
          ...updatedPrivilegeAssignment,
        };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
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
  setError,
} = rbacSlice.actions;
export default rbacSlice.reducer;
