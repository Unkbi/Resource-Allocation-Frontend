export interface GitHubDetails {
  Username: string | null;
  Token: string | null;
  Org: string | null;
}

export interface OpenAIDetails {
  Key: string | null;
  FinetunedModel: string | null;
}

export interface User {
  GitHub: GitHubDetails;
  OpenAI: OpenAIDetails;
  AppId: string | null;
  FirstName: string;
  LastName: string;
  Email: string;
}

export interface UserResource {
  id: string;
  Name: string;
  email: string | null;
  UserId: string | null;
  location: string | null;
  resourceStatus: string | null;
  userStatus: string | null;
  __created: string | null;
  __created_by: string | null;
  __last_modified: string | null;
  __last_modified_by: string | null;
}

export interface UserFormValues {
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  Role: string | null;
  sendInviteEmail: boolean;
}

export interface ResourceToUserFormValues {
  Resources: Array<string> | null;
  Role: string | null;
  sendInviteEmail: boolean;
}
