import { Organisation } from './organisationTypes';
import { Team } from './teamTypes';

export interface Resource {
  FirstName: string | null;
  LastName: string | null;
  FullName: string | null;
  Email: string;
  PhoneNumber: string | null;
  Id: string;
  StartDate: string | null;
  EndDate: string | null;
  LocationCategory: string | null;
  WorkLocation: string | null;
  Department: string | null;
  HRLevel: string | null;
  Manager: string | null;
  Role: string | null;
  Type: string | null;
  ContractorHourlyRate: number | null;
  ContractorHourlyRateCurrency: string | null;
  AverageWeeklyHours: number | null;
  __path__: string | null;
  __parent__: string | null;
  Status: string | null;
}

export interface AllResourceDetail {
  Resource: Resource | null;
  Team: Team | null;
  Organisation: Organisation | null;
}

export interface AllResourcesDetailState {
  allResourcesDetail: AllResourceDetail[] | null;
  loading: boolean;
  error: string | null;
  dataProcessing: boolean;
}
