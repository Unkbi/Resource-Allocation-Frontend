import { ReportUIFilters, ReportType } from './dashboardTypes';

export interface SavedReport {
  Id: string;
  Name: string;
  Description?: string;
  Filters: ReportUIFilters;
  ReportType: ReportType;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface SavedReportsState {
  savedReports: SavedReport[];
  loading: boolean;
  error: string | null;
}
