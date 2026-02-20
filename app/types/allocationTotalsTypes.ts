
export interface AllocationTotalsState {
  totalAllocations: ProjectTotal[];
  totalAllocationCosts:TotalAllocationCostResponse | null;
  totalAllocationSummary: AllocationSummary | null;
  totalAllocationsTillDate: ProjectTotal[];
  totalAllocationCostsTillDate: TotalAllocationCostResponse | null;
  totalAllocationSummaryTillDate: AllocationSummary | null;
  dataProcessing: boolean;
  loading: boolean;
  error: string | null;
  totalAllocationsGrandTotal: number;
  totalActualsGrandTotal: number;
  totalAllocationsTillDateGrandTotal: number;
  totalActualsTillDateGrandTotal: number;
}

export interface ResourceTotal {
  Resource: string;
  ResourceName: string;
  TotalAllocationsEntered: number;
  TotalActualsEntered: number;
}

export interface ProjectTotal {
  Project: string;
  ProjectName: string;
  Status: string;
  TotalAllocationsEntered: number;
  TotalActualsEntered: number;
  ResourceTotals: ResourceTotal[];
}

export interface AllocationSummary {
  grandAllocations: number;
  grandActuals: number;
}

export interface ResourceCost {
  Resource: string;
  ResourceName: string;
  TotalPlannedCost: number;
  TotalActualsCost: number;
}

export interface ProjectCost {
  Project: string;
  ProjectName: string;
  Status: string;
  TotalPlannedCost: number;
  TotalActualsCost: number;
  ResourceCosts: ResourceCost[];
}

export interface TotalAllocationCostResponse {
  Projects: ProjectCost[];
  GrandTotalPlannedCost: number;
  GrandTotalActualsCost: number;
}
