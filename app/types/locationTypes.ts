export interface Location {
    Id: string;
    Name: string | null;
    LocationGroup: string | null;
    Status: string | null;
    __path__: string | null;
    __parent__: string | null;
}

export interface LocationGroup {
    Id: string;
    Name: string | null;
  __path__: string | null;
  __parent__: string | null;
}

export interface AddLocationPayload {
    Name: string | null;
    LocationGroup: string | null;
    Status: string | null;
}