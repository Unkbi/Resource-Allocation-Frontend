import { ApiResponse } from '.';
import { Allocation, AllocationGridCell } from './allocationTypes';
import { Resource } from './resourceTypes';

export interface Team {
  Id: string;
  Name: string | null;
  Status: string | null;
  AllocationManager: string | null;
  __parent__: string | null;
}

export interface GetTeamResourcesPayload {
  'ResourceAllocation.Core/GetTeamResources': {
    TeamId: string;
  };
}

export interface GetTeamAllocationsForPeriodPayload {
  'ResourceAllocation.Core/GetTeamAllocationsForPeriod': {
    TeamId: string;
    StartDate: string;
    EndDate: string;
  };
}

export interface TransferAllocationsPayload {
  ResourceFrom: string;
  ResourceTo: string;
  StartDate: string;
  EndDate: string;
}
export interface GetResourceAllocationsForPeriodPayload {
  Resource: string;
  StartDate: string;
  EndDate: string;
}

export interface TeamResources {
  [key: string]: Resource[] | null;
}

export interface CalendarDate {
  startDate: string | null;
  endDate: string | null;
}

export interface TeamState {
  teams: Team[] | null;
  resources: AllocationGridCell[] | null;
  allAllocations: ApiResponse<Allocation[]> | {} | null;
  teamAllocations: ApiResponse<Allocation[]> | {} | null;
  teamsResources: TeamResources | null;
  loading: boolean;
  dataProcessing: boolean;
  error: string | null;
  calendarDate: CalendarDate | null;
}

export interface TeamResourceResponse {
  id: string; // Team ID
  teamStatus: 'fulfilled' | 'rejected'; // Status of the team resource fetch
  teamAllocationManager: string | null; // Team allocation manager (nullable)
  resource: Resource[]; // Array of resources
}

export interface TeamResourcePayload {
  Team: string;
  Resource: string;
}
