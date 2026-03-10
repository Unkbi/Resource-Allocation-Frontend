import { ReportUIFilters, ReportType } from './dashboardTypes';

export interface SavedReport {
  Id: string;
  UserId: string;
  Name: string;
  Description?: string;
  ReportType: ReportType;
  Filters: Record<string, any>; // UI filters like Status, Teams, Orgs, etc.
  GridFilters: Record<string, any>; // Grid-level filters (empty for now)
  Columns: string[];
  SortBy: string;
  SortOrder: 'asc' | 'desc';
  IsDefault: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CreateSavedReportPayload {
  UserId: string;
  Name: string;
  Description?: string;
  ReportType: ReportType;
  Filters: Record<string, any>;
  GridFilters: Record<string, any>;
  Columns: string[];
  SortBy: string;
  SortOrder: 'asc' | 'desc';
  IsDefault: boolean;
}

export interface UpdateSavedReportPayload {
  Id: string;
  UserId: string;
  Name?: string;
  Description?: string;
  IsDefault?: boolean;
  // SortOrder?: 'asc' | 'desc';
  Columns?: string[];
  Filters?: Record<string, any>;
  GridFilters?: Record<string, any>;
  // SortBy?: string;
}

export interface GetUserSavedReportsPayload {
  UserId: string;
}

export interface GetUserSavedReportsResponse {
  UserReports: SavedReport;
}

export interface SavedReportsState {
  savedReports: SavedReport[];
  loading: boolean;
  error: string | null;
  currentLoadedReport: SavedReport | null;
}
