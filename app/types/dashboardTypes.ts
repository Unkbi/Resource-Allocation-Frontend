export interface ChartParams {
  chartKey: string;
  startDate: string;
  endDate: string;
  bucket: string;
  projectTypeFilter?: string[] | null;
  projectTypeGroupFilter?: string[] | null;
  portfolioFilter?: string[] | null;
  teamFilter?: string[] | null;
  teamAllocMgrFilter?: string[] | null;
  orgFilter?: string[] | null;
}

export interface AdvancedFilters {
  ProjectTypeGroup?: string[];
  ProjectType?: string[];
  Team?: string[];
  Resource?: string[];
  AllocationManager?: string[];
  ProjectManager?: string[];
  Project?: string[];
  Portfolio?: string[];
  Organization?: string[];
}

export interface DashboardChartState {
  advancedFilters: AdvancedFilters;
  defualtAdvancedFilters: AdvancedFilters;
  loadingAdvancedFilters: boolean;
  loading: boolean;
  loadingCharts: Record<string, boolean>;
  report?: ReportState;
  [chartKey: string]:
    | any[]
    | AdvancedFilters
    | boolean
    | Record<string, boolean>
    | ReportState
    | undefined;
}

// Reports
export type ReportType =
  | 'projectsOnly'
  | 'resourceOnly'
  | 'projectPeriod'
  | 'resourcePeriod'
  | 'resourceProjectPeriod'
  | 'resourceProjectPeriodCost'
  | 'percentageAllocation'
  | 'allocationCapacity'

export type SummaryType =
  | 'project'
  | 'team';

export interface ReportUIFilters {
  reportType: ReportType;
  period: 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'custom';
  customStartDate?: string; // ISO string if period === 'custom'
  customEndDate?: string;   // ISO string if period === 'custom'
  team?: string[];
  organization?: string[];
  resourceType?: string[];
  resource?: string[];
  projectType?: string[];
  projectTypeGroup?: string[];
  project?: string[];
  portfolio?: string[];
  projectManager?: string[];
  allocationManager?: string[];
  resourceStatuses?: string[];
  resourceLocations?: string[];
  resourceWorkLocationGroup?: string[];
  projectStatuses?: string[];
}

export interface ReportEntry {
  loading: boolean;
  error?: string | null;
  data: any[];
  uiFilters?: ReportUIFilters; // what the user selected (serialized)
  requestPayload?: any; // exact payload sent to the API
}

export type ReportState = Record<ReportType, ReportEntry>;
