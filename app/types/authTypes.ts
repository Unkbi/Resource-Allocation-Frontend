export interface LoginPayload {
  Username: string;
  Password: string;
}

export interface AuthenticationResult {
  'expires-in': number;
  'access-token': string;
  'id-token': string;
  'refresh-token': string;
  'token-type': string;
}

export interface LoginResponse {
  'authentication-result': AuthenticationResult;
}

export interface UserAttributes {
  Name: string;
  Value: string;
}

export interface UserRBAC {
  resource: string | null;
  roles: any;
  permissions: any;
  expression: {
    lhs: string | null;
    rhs: string | null;
  };
}

export interface LoginUser {
  id: string;
  username: string | null;
  systemUserInfo: {
    localUser: {
      record: {
        name: string;
        moduleName: string | null;
        type: number | null;
        schema: any;
        afterTriggers: any;
        rbac: UserRBAC[];
      };
      name: string | null;
      moduleName: string | null;
      attributes: any;
    };
    cognitoData: {
      userAttributes: UserAttributes[];
      userCreateDate: string | null;
      userLastModifiedDate: string | null;
      userStatus: string | null;
      enabled: boolean;
    };
  };
}
