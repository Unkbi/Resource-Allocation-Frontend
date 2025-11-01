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

export interface UserFormValues {
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  Role: string | null;
}

export interface ResourceToUserFormValues {
  Resources: Array<string> | null;
  Role: string | null;
}