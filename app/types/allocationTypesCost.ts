import { AllAllocations, AllocationGridCellData } from './allocationTypes';

export interface CostAllocation {
  ProjectName: string | null;
  Id: string;
  ProjectManager: string | null;
  Period: string;
  Resource: string;
  Duration: string | null;
  ResourceName: string | null;
  Cost: number;
  Project: string;
}

export interface GetAllCostForPeriodPayload {
  'ResourceAllocation.Core/GetAllCostForPeriod': {
    StartDate: string;
    EndDate: string;
  };
}

export interface AllocationsCost {
  id: string;
  Project: string;
  ProjectName: string;
  Resource: string;
  ResourceName: string;
  Period: string;
  Duration: 'week' | 'month' | string;
  cost: number;
}

export interface AllAllocationsCost {
  id: string;
  resourceId: string | null;
  project: string | null;
  projectId: string | null;
  projectSponsor: string | null;
  projectManager: string | null;
  projectStatus: string | null;
  projectLocation: string | null;
  projectType: string | null;
  projectOvertimeAllowed: boolean | null;
  projectCost: number | null;
  projectCurrency: string | null;
  projectStartDate: string | null;
  projectEndDate: string | null;
  resource: string | null;
  totalCost: number | null;
  role: string | null;
  teams: string | null;
  resourceType: string | null;
  teamStatus: string | null;
  teamAllocationManager: string | null;
  [key: string]:
    | AllocationGridCellData
    | string
    | number
    | boolean
    | null
    | undefined;
}

export interface AllocationsCostState {
  costs: AllAllocations[];
  loading: boolean;
  error: string | null;
  dataProcessing: boolean;
}

export interface GetAllCostForPeriodResponse {
  ActualsCost: number | null;
  AllocationRef: string | null;
  CostCurrency: string | null;
  Duration: string | null;
  EmployeeRateRef: string | null;
  Period: string | null;
  PlannedCost: number | null;
  Project: string | null;
  ProjectName: string | null;
  ResourceName: string | null;
  ResourceRef: string | null;
  __Id__: string;
  __parent__: string | null;
  __path__: string | null;
}
