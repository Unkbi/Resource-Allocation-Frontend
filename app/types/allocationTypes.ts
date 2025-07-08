import { ProjectsTableRow } from './component';

export interface Allocation {
  ProjectName: string | null;
  Id: string;
  ProjectManager: string | null;
  Period: string;
  Resource: string;
  Duration: string | null;
  ResourceName: string | null;
  AllocationEntered: number;
  Project: string;
  ActualsEntered: number;
  Notes: string | null;
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
  actuals?: number | null; // Actuals for the cell
  notes?: string | null; // Notes for the cell
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

export interface ToolbarFilters {
  field: string | null;
  operator: string | null;
  value: string | null;
}

export interface AllocationGridView {
  Id: string | null;
  UserId: string | null;
  Name: string | null;
  Description: string | null;
  isDefault: boolean;
  isProjectDefault: boolean;
  GroupBy: string | null;
  MyTeam: boolean;
  MyProjects: boolean;
  ColumnsVisible: string[] | null;
  StartDate: string | null;
  EndDate: string | null;
  isFixedRange: boolean;
  isDynamicRange: boolean;
  WeekPlus: number | null;
  WeekMinus: number | null;
  Filters: ToolbarFilters[] | null;
}

export interface AllColumns {
  team: string[];
  project: string[];
  portfolioName: string[];
  project_cost: string[];
}

export interface AllocationGridViewState {
  view: string | null;
  splitView: boolean;
  splitViewCurrentProject: ProjectsTableRow | null;
  showActuals: boolean;
  loading: boolean;
  error: string | null;
  columns: AllColumns;
  expandRowId: any[]; // This has to be changed to a Specific type.
  cellSelectionData: any; // This has to be changed to a Specific type.
  currentView: AllocationGridView;
  savedViews: AllocationGridView[];
}

export interface GetUsersSavedViewsPayload {
  'ResourceAllocation.Core/UserAllocationView': {
    UserId: string;
  };
}

export interface GetUsersSavedViewsResponse {
  isDefault: boolean | null;
  StartDate: string | null;
  isFixedRange: boolean | null;
  WeekPlus: number | null;
  GroupBy: string | null;
  Columns: string[] | null;
  UserId: string | null;
  ShowBy: string | null;
  __Id__: string | null;
  Name: string | null;
  __path__: string | null;
  Description: string | null;
  EndDate: string | null;
  isDynamicRange: boolean | null;
  Filters: string[] | null;
  WeekMinus: number | null;
  __parent__: boolean | null;
}

export interface AllAllocations {
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
  totalEffort: number | null;
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

export interface AllAllocationsState {
  allAllocations: AllAllocations[] | null;
  dataProcessing: boolean | null;
  loading: boolean | null;
  calendarDate: {
    startDate: string | null;
    endDate: string | null;
  };
}

export interface ActualAllocationsForPeriodPayload {
  'ResourceAllocation.Core/GetActualizedAllocationsByPeriod': {
    Resource: string;
    StartDate: string;
    EndDate: string;
  };
}

export interface ConfirmActuals {
  Project: string;
  ActualsEntered: number;
}

export interface ConfirmActualAllocationsForPeriodRequest {
  'ResourceAllocation.Core/ConfirmActualsEntered': {
    Resource: string;
    Period: string;
    Status: string;
    Actuals: ConfirmActuals[];
  };
}

export interface ActualAllocations {
  ActualsEntered: number | null;
  AllocationEntered: number | null;
  Duration: string | null;
  Id: string | null;
  Notes: string | null;
  Period: string | null;
  Project: string | null;
  ProjectName: string | null;
  Resource: string | null;
}

export interface ActualAllocationsForPeriodResponse {
  Allocs: ActualAllocations[];
  Status: string | null;
}

export interface ActualAllocationsState {
  actualAllocations: ActualAllocations[] | null;
  status: string | null;
  dataProcessing: boolean | null;
  loading: boolean | null;
  calendarDate: {
    startDate: string | null;
    endDate: string | null;
  };
}
