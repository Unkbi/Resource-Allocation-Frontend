import { ApiResponse } from '.';
import { AllocationGridCell } from './allocationTypes';

export interface Project {
  ProjectManager: string | null;
  BudgetCurrency: string | null;
  StartDate: string | null;
  Id: string;
  ProjectSponsor: string | null;
  AllowOvertime: boolean;
  Name: string;
  __path__: string | null;
  Description: string | null;
  Type: string | null;
  EndDate: string | null;
  Budget: number | null;
  Location: string | null;
  __parent__: string | null;
  Status: string | null;
}

export interface ProjectState {
  projects: ApiResponse<Project[]> | null; //Change this
  allocations: AllocationGridCell[];
  loading: boolean;
  dataProcessing: false;
  error: string | null;
  updating: boolean;
  calendarDate: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface GetProjectAllocationsForPeriodPayload {
  'ResourceAllocation.Core/GetProjectAllocationsForPeriod': {
    Project: string;
    StartDate: string;
    EndDate: string;
  };
}
