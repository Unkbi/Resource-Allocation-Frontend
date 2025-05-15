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
