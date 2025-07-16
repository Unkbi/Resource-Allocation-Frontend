export interface Role {
  Name: string;
  __path__: string | null;
  __parent__: string | null;
}

export interface RoleAssignment {
  Assignee: string;
  Name: string;
  Role: string;
  __path__: string | null;
  __parent__: string | null;
}

export type PrivilegeActions = 'create' | 'read' | 'update' | 'delete';
export interface Privilege {
  Actions: PrivilegeActions[];
  Name: string;
  Resource: string[] | null;
  __path__: string | null;
  __parent__: string | null;
}

export interface PrivilegeAssignment {
  Privilege: string;
  Name: string;
  Role: string;
  __path__: string | null;
  __parent__: string | null;
}

export interface RBACState {
  roles: Role[];
  roleAssignments: RoleAssignment[];
  privileges: Privilege[];
  privilegeAssignments: PrivilegeAssignment[];
  loading: true;
  error: false;
}
