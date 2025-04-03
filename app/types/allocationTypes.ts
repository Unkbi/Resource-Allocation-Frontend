export interface Allocation {
  ProjectName: string | null;
  Id: string;
  Manager: string | null;
  Period: string;
  Resource: string;
  Duration: string | null;
  ResourceName: string | null;
  AllocationEntered: number;
  Project: string;
}

export interface GetAllAllocationsForPeriodPayload {
  'ResourceAllocation.Core/GetTeamAllocationsForPeriod': {
    TeamId: string;
    StartDate: string;
    EndDate: string;
  };
}

export interface AllocationGridCellData {
  allocationId: string | null;
  period: string | null;
  value: number | null;
}

export interface AllocationGridCell {
  id: string;
  project: string | null;
  projectId: string | null;
  resource: string | null;
  resourceId: string | null;
  resourceType: string | null;
  role: string | null;
  teamAllocationManager: string | null;
  teamStatus: string | null;
  teams: string | null;
  totalEffort: number | null;
  [key: string]: AllocationGridCellData | string | number | null;
}
