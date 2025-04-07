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
  'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
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
  project: string | null; // Project Name
  projectId: string | null;
  projectCost?: number | null; // Only for Projects View
  projectCurrency?: string | null; // Only for Projects View
  projectStartDate?: string | null; // Only for Projects View
  projectEndDate?: string | null; // Only for Projects View
  projectLocation?: string | null; // Only for Projects View
  projectManager?: string | null; // Only for Projects View
  projectOvertimeAllowed?: boolean | null; // Only for Projects View
  projectSponsor?: string | null; // Only for Projects View
  projectStatus?: string | null; // Only for Projects View
  projectType?: string | null; // Only for Projects View
  resource: string | null;
  resourceId: string | null;
  resourceType: string | null;
  role: string | null;
  teamAllocationManager?: string | null; // Only for Teams View
  teamStatus?: string | null; // Only for Teams View
  teams: string | null;
  totalEffort: number | null;
  [key: string]:
    | AllocationGridCellData
    | string
    | number
    | boolean
    | null
    | undefined;
}
