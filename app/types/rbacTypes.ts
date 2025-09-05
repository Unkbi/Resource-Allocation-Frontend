export interface Role {
  name: string;
  __path__: string | null;
  __parent__: string | null;
}

export interface RoleAssignment {
  User: string; 
  Role: string;
  __path__: string | null;
  __parent__: string | null;
}

export type PrivilegeActions = 'c' | 'r' | 'u' | 'd';
export interface Privilege {
  Actions: PrivilegeActions[];
  id: string;
  resourceFqName: string[] | null;
  __path__: string | null;
  __parent__: string | null;
}

export interface PrivilegeAssignment {
  Permission :string;
  Role: string;
  __path__: string | null;
  __parent__: string | null;
}

export interface UserRbac {
  id: string; 
  email: string;
  firstName: string;
  lastName: string;
  __path__: string | null;
  __parent__: string | null;
}

export interface RBACState {
  user: UserRbac[] | null;
  roles: Role[];
  roleAssignments: RoleAssignment[];
  privileges: Privilege[];
  privilegeAssignments: PrivilegeAssignment[];
  loading: true;
  error: false;
}
