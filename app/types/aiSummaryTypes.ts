/**
 * AI Summary Types
 * Types for AI-generated project summaries
 */

export interface ProjectSummary {
  project_id: string;
  period: string;
  project_score: number | null;
  project_score_band: string | null;
  alignment_score: number | null;
  project_health_score: number | null;
  summary_markdown: string | null;
  summary_html: string | null;
  generated_date: string | null;
}

// Raw API response types based on the actual API structure
export interface ProjectPeriodData {
  Period: string;
  ProjectScore: number | null;
  AlignmentScore: number | null;
  ProjectHealthScore: number | null;
  ProjectScoreBand: string | null;
  Summary: string | null;
  SummaryHtml: string | null;
}

export interface AIProjectSummaryDetail {
  Project: {
    Id: string;
    Name: string;
  };
  ProjectManager: {
    Firstname: string;
    PreferredFirstname?: string;
  };
  ProjectTypeGroup: {
    Name: string;
  };
  Portfolio: {
    Name: string;
  } | null;
  ProjectSponsor: string | null;
  ProjectPeriod: ProjectPeriodData[];
}

export interface ProjectSummaryHistory {
  project_id: string;
  summaries: ProjectSummary[];
  total_count: number;
}

export interface GetProjectSummaryRequest {
  ProjectId: string;
  Period: string; // Format: "YYYY-MM-DD"
}

export interface GetProjectSummaryHistoryRequest {
  ProjectId: string;
  StartPeriod?: string; // Optional, defaults to -12 weeks
  EndPeriod?: string; // Optional, defaults to current week
  Limit?: number; // Optional, from ScalarSetting
}

export interface AISummaryState {
  currentSummary: any | null; // Array of AIProjectSummaryDetail from API
  summaryHistory: ProjectSummaryHistory | null;
  loading: boolean;
  error: string | null;
  loadingHistory: boolean;
  historyError: string | null;
  uiFilters: any | null; // Store the UI filters used to generate the summary
  requestPayload: any | null; // Store the API request payload
  gridFilters?: Record<string, any>; // DataGrid-specific filters to apply to the grid
}

export type SummaryType = 'project' | 'resource' | 'team'; // Extensible for future summary types

export interface AISummaryFilters {
  summaryType: SummaryType;
  period: string;
  customDateRange?: [any, any];
  customStartDate?: string;
  customEndDate?: string;
  // Reuse the same filters as reports
  project: string[];
  team: string[];
  organization: string[];
  resourceType: string[];
  resource: string[];
  projectType: string[];
  projectTypeGroup: string[];
  portfolio: string[];
  projectManager: string[];
  allocationManager: string[];
  resourceStatuses: string[];
  resourceLocations: string[];
  resourceWorkLocationGroup: string[];
  projectStatuses: string[];
}
