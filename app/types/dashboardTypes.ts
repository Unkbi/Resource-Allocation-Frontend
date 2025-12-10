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
  [chartKey: string]:
    | any[]
    | AdvancedFilters
    | boolean
    | Record<string, boolean>;
}
