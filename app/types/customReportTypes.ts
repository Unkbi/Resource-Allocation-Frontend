// Types for Custom Report Tab

export interface CustomReportRow {
  id: string;
  resource: string;
  resource_type: string;
  project_type_group: string;
  project_type: string;
  plan: number;
  actuals_variance: number;
  allocation_period: string;
  team: string;
  organization: string;
}

export interface CustomReportCategoryData {
  category: string;
  allocation: number;
  actuals: number;
}

export interface CustomReportResponse {
  team_name: string;
  ChartData: CustomReportCategoryData[];
  GridData: CustomReportRow[];
}

export interface CustomReportFilters {
  project_type_group?: string[];
  project_type?: string[];
  team?: string[];
  organization?: string[];
  start_date?: string;
  end_date?: string;
  show_actuals?: boolean;
}

export interface CustomReportState {
  currentReport: CustomReportResponse | null;
  loading: boolean;
  error: string | null;
  filters: CustomReportFilters;
}
