export interface ProjectType {
  Id: string;
  Name: string | null;
  Description: string | null;
  Color: string | null;
  Status: string | null;
  Group: string | null;
  AllowAllocation: boolean;
  AllowActuals: boolean;
  __path__: string | null;
  __parent__: string | null;
}

export interface ProjectTypeGroup {
  Id: string;
  Name: string | null;
  __path__: string | null;
  __parent__: string | null;
}

export interface AddProjectTypePayload {
  Name: string;
  Description: string | null;
  Color: string;
  Status: string;
  AllowAllocation: boolean;
  AllowActuals: boolean;
  Group: string;
}
