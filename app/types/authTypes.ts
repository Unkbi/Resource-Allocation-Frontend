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
