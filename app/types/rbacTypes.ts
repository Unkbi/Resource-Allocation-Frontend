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

export interface AttributeProperties {
  id?: boolean;
  default?: string;
  unique?: boolean;
  optional?: boolean;
  enum?: string[];
  [key: string]: any;
}

export interface Attribute {
  name: string;
  type: string;
  properties?: string | AttributeProperties; 
}

export type RelationshipDirection = "parent" | "child";
export type RelationshipCardinality = "one-to-one" | "one-to-many" | "many-to-many";

export interface Relationship {
  name: string;
  type: string; // "between"
  direction: RelationshipDirection;
  target: string; // fqName : "Resource/Resource"
  cardinality: RelationshipCardinality;
}

export interface EntityMeta {
  audit?: boolean;
  [key: string]: any;
}

export interface Entity {
  name: string;
  module: string;
  fqName: string;
  type: string; 
  attributes: Attribute[];
  relationships: Relationship[];
  meta: EntityMeta;
}

export interface Entities {
  [moduleName: string]: Entity[];
}

export interface EventAttribute {
  name: string;
  type: string;
  properties?: string | AttributeProperties;
}

export interface EventMeta {
  [key: string]: any;
}

export interface Event {
  name: string;
  module: string;
  fqName: string;
  type: "event";
  attributes: EventAttribute[];
  meta: EventMeta;
}

export interface Events {
  [key: string]: Event[]; 
}

export type Modules = string[];

export interface Meta {
  entities: Entities;
  events: Events;
  modules: Modules;
}


export interface RBACState {
  user: UserRbac[] | null;
  roles: Role[];
  roleAssignments: RoleAssignment[];
  privileges: Privilege[];
  privilegeAssignments: PrivilegeAssignment[];
  meta: Meta | null;
  loading: true;
  error: false;
}
