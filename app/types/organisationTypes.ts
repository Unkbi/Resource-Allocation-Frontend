export interface Organisation {
  Id: string;
  Name: string | null;
  Status: string | null;
  __path__: string | null;
  __parent__: string | null;
}

export interface OrganisationState {
  organisations: Organisation[] | null;
  loading: boolean;
  error: string | null;
}
