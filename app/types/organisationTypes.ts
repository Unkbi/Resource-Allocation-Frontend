import { Resource } from './resourceTypes';

export interface Organisation {
  Id: string;
  Name: string | null;
  Status: string | null;
  __path__: string | null;
  __parent__: string | null;
}

export interface OrganisationResources {
  [key: string]: Resource[] | null;
}

export interface OrganisationState {
  organisations: Organisation[] | null;
  organisationsResources: OrganisationResources | null;
  loading: boolean;
  error: string | null;
}

export interface GetOrganizationResourcesPayload {
  'ResourceAllocation.Core/GetOrganizationResources': {
    OrganizationId: string;
  };
}

export interface ResourceOrganizationPayload {
  Organization: string;
  Resource: string;
}
