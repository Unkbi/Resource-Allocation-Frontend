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

export interface AllocationsCostState {
  costs: AllocationsCost[];
  loading: boolean;
  error: string | null;
}
