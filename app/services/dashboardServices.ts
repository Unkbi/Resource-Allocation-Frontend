import axiosInstance from '../utils/apiClient';
import apiClient from '../utils/apiClient';
import { calculateDateRange } from '../utils/dateUtils';
const { isFilterEnabled, isPeriodRequired } = require('../components/Dashboard/ReportBuilder/reportFilterConfig');

export interface DashboardFilterPayload {
  StatusFilter?: string;
  Teams?: string[];
  Orgs?: string[] | null;
  Organizations?: string[] | null;
  ProjectTypes?: string[] | null;
  Portfolios?: string[] | null;
  ProjectManagers?: string[];
  Resources?: string[];
  AllocationManagers?: string[];
  ResourceTypes?: string[] | null;
  ProjectTypeGroups?: string[];
  Projects?: string[];
  ResourceStatuses?: string[];
  ResourceLocations?: string[];
  ResourceWorkLocationGroup?: string[];
  ProjectStatuses?: string[];
  StartDate?: string;
  EndDate?: string;
  Bucket?: string;
  TimeBucket?: string;
  MetricType?: string;
  AnalysisType?: string;
  GroupByDimension?: string;
  ExcludedResourceType?: string;
  ExcludedProjectTypes?: string;
  OverAllocThreshold?: number;
  UnderAllocThreshold?: number;
  SelectColumns?: string;
  OrderByClause?: string;
  DynamicWhere?: string;
  GroupByClause?: string;
}

const CHART_API_MAPPING: Record<string, string> = {

  // Group 1: Actuals Status Plan Deviation Analytics
  actualsConfirmed: '/Resource/ExecuteActualsStatusPlanDeviationAnalyticsQuery',
  resourceActualsDeviation: '/Resource/ExecuteActualsStatusPlanDeviationAnalyticsQuery',
  
  // Group 2: Team Capacity Utilization Analytics
  resourceCoverage: '/Resource/ExecuteTeamCapacityUtilizationAnalyticsQuery',
  resourceUtilization: '/Resource/ExecuteTeamCapacityUtilizationAnalyticsQuery',
  
  // Group 3: Actual Hours Work Distribution
  unapprovedProjectActualsByTeam: '/Resource/ExecuteActualHoursWorkDistributionQuery',
  unapprovedProjectAllocation: '/Resource/ExecuteActualHoursWorkDistributionQuery',

   // Group 4: Allocation Percentage Project FTE Metrics
  allocationPercentage: '/Resource/ExecuteAllocationPercentageProjectFTEMetricsQuery',
  projectFTE: '/Resource/ExecuteAllocationPercentageProjectFTEMetricsQuery',
  
  // Group 5: Cost Budget Variance Analytics
  budgetVsPlanVsActual: '/Resource/ExecuteCostBudgetVarianceAnalyticsQuery',
  totalResourceCost: '/Resource/ExecuteCostBudgetVarianceAnalyticsQuery',

  //Group 6: Actuals Trend Analytics
  actualsTrendWeekly: '/Resource/ExecuteActualsTrendWeeklyQuery',

  //Group 7: Team Engagement Analytics
  teamEngagementScore: '/Resource/ExecuteTeamEngagementScoreQuery',

  //Group 8: Team Project Score Analytics
  projectScoreByTeam: '/Resource/ExecuteTeamProjectScoreQuery',
  // PM Project Score Analytics
  projectScoreByPM: '/Resource/ExecutePMProjectScoreQuery',

  //Group 9: Project Health Score Analytics
  projectHealthOverview: '/Resource/GetProjectHealthOverview',

  engagementScoreOverview: '/Resource/GetEngagementOverview',

};

// Report API mappings
export const REPORT_API_MAPPING: Record<string, string> = {
  projectsOnly: '/Resource/GetAllProjectsWithDetails',
  resourceOnly: '/Resource/GetAllResourcesWithDetails',
  projectPeriod: '/Resource/GetAllProjectsWithPeriodDetails',
  resourcePeriod: '/Resource/GetAllResourcesWithPeriodActualsStatus',
  resourceProjectPeriod: '/Resource/GetAllocationActualsReport',
  resourceProjectPeriodCost: '/Resource/GetAllocationCostReport',
};

/**
 * Build chart-specific payload based on chart key
 */
const buildChartPayload = (chartKey: string, filters: DashboardFilterPayload): DashboardFilterPayload => {
  // Base filters - all from advanced filters with standardized naming
  const baseFilters = {
    Teams: filters.Teams || [],
    Orgs: filters.Orgs || [],
    ProjectTypeGroups: filters.ProjectTypeGroups || [],
    ProjectTypes: filters.ProjectTypes || [],
    Projects: filters.Projects || [],
    Portfolios: filters.Portfolios || [],
    ProjectManagers: filters.ProjectManagers || [],
    Resources: filters.Resources || [],
    AllocationManagers: filters.AllocationManagers || [],
  };

  // Chart-specific payload configurations
  const payloadConfigs: Record<string, Partial<DashboardFilterPayload>> = {

    // Group 2: Team Capacity Utilization Analytics
    resourceUtilization: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'utilization',
      ExcludedResourceType: 'Contractor - PT',
      ...baseFilters,
      OverAllocThreshold: 100,
      UnderAllocThreshold: 80,
      SelectColumns: '',
      OrderByClause: 'team_name, period_start',
      DynamicWhere: '',
    },
    resourceCoverage: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'coverage',
      ExcludedResourceType: 'Contractor - PT',
      ...baseFilters,
      SelectColumns: '',
      OrderByClause: 'team_name, period_start',
      DynamicWhere: '',
    },

    // Group 3: Actual Hours Work Distribution
    unapprovedProjectActualsByTeam: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      GroupByDimension: 'tm.team_id',
      ...baseFilters,
      SelectColumns: '',
      OrderByClause: '',
      DynamicWhere: '',
    },
    unapprovedProjectAllocation: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      ...baseFilters,
      SelectColumns: '',
      OrderByClause: '',
      DynamicWhere: '',
      GroupByClause: '',
      GroupByDimension: ''
    },
    
    // Group 4: Cost Budget Variance Analytics
    budgetVsPlanVsActual: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      AnalysisType: 'budget_comparison',
      ...baseFilters,
      ExcludedResourceType: 'Contractor - PT',
      OrderByClause: '1',
      DynamicWhere: 'AND x.analysis_type = \'budget_comparison\'',
    },
    totalResourceCost: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      AnalysisType: 'total_cost',
      ...baseFilters,
      ExcludedResourceType: 'Contractor - PT',
      OrderByClause: '1',
      DynamicWhere: 'AND x.analysis_type = \'total_cost\'',
    },

    // Group 5: Allocation Percentage Project FTE Metrics
    allocationPercentage: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'allocation_percentage',
      ...baseFilters,
      ExcludedResourceType: 'Contractor - PT',
      ExcludedProjectTypes: '',
      SelectColumns: '',
      OrderByClause: '',
      DynamicWhere: '',
    },
    projectFTE: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'project_fte',
      ...baseFilters,
      ExcludedResourceType: 'Contractor - PT',
      ExcludedProjectTypes: '',
      SelectColumns: '',
      OrderByClause: '',
      DynamicWhere: '',
    },

    // Group 6: Actuals Status Plan Deviation Analytics
    actualsConfirmed: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'actuals_confirmed',
      ...baseFilters,
      ExcludedResourceType: '',
      SelectColumns: '',
      OrderByClause: '1',
      DynamicWhere: 'AND metric_type = \'actuals_confirmed\'',
    },
    resourceActualsDeviation: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'actuals_deviation',
      ...baseFilters,
      ExcludedResourceType: '',
      OrderByClause: '1',
      DynamicWhere: 'AND metric_type = \'actuals_deviation\'',
    },

    actualsTrendWeekly: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      ...baseFilters,
      SelectColumns: '',
      OrderByClause: '',
      DynamicWhere: '',
    },

    // Group 7: Team Engagement Analytics
    teamEngagementScore: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      ...baseFilters,
      SelectColumns: '',
      OrderByClause: '',
      DynamicWhere: '',
    },

    // Group 8: Team Project Score Analytics
    projectScoreByTeam: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      ...baseFilters,
      SelectColumns: '',
      OrderByClause: '',
      DynamicWhere: '',
    },
    
    projectScoreByPM: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      // TimeBucket: filters.TimeBucket || 'week',
      // ...baseFilters,
      // SelectColumns: '',
      // OrderByClause: '',
      // DynamicWhere: '',
    },

    // Group 9: Project Health Score Analytics
    projectHealthOverview: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      ...baseFilters,
    },

    engagementScoreOverview: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      ...baseFilters,
    },

  };
  return payloadConfigs[chartKey] || baseFilters;
};

// Build a report payload from UI-style filters
export const buildReportPayload = (uiFilters: any): DashboardFilterPayload => {
  const period: string = uiFilters?.period || 'last_week';
  const customStart: string | undefined = uiFilters?.customStartDate;
  const customEnd: string | undefined = uiFilters?.customEndDate;
  const reportType: string = uiFilters?.reportType;

  // Calculate date range using shared utility
  const dateRange = calculateDateRange(period, customStart, customEnd);
  const StartDate = dateRange.start;
  const EndDate = dateRange.end;

  const sanitize = (arr?: string[]) => (Array.isArray(arr) ? arr.filter(v => v) : []);

  // Build payload with only enabled filters
  const payload: DashboardFilterPayload = {};

  // Add date fields only if period is required for this report type
  if (isPeriodRequired(reportType)) {
    payload.StartDate = StartDate;
    payload.EndDate = EndDate;
  }

  // Conditionally add filters based on report type config
  if (isFilterEnabled(reportType, 'team')) {
    payload.Teams = sanitize(uiFilters?.team);
  }
  if (isFilterEnabled(reportType, 'organization')) {
    payload.Organizations = sanitize(uiFilters?.organization);
  }
  if (isFilterEnabled(reportType, 'projectTypeGroup')) {
    payload.ProjectTypeGroups = sanitize(uiFilters?.projectTypeGroup);
  }
  if (isFilterEnabled(reportType, 'projectType')) {
    payload.ProjectTypes = sanitize(uiFilters?.projectType);
  }
  if (isFilterEnabled(reportType, 'project')) {
    payload.Projects = sanitize(uiFilters?.project);
  }
  if (isFilterEnabled(reportType, 'portfolio')) {
    payload.Portfolios = sanitize(uiFilters?.portfolio);
  }
  if (isFilterEnabled(reportType, 'projectManager')) {
    payload.ProjectManagers = sanitize(uiFilters?.projectManager);
  }
  if (isFilterEnabled(reportType, 'resource')) {
    payload.Resources = sanitize(uiFilters?.resource);
  }
  if (isFilterEnabled(reportType, 'allocationManager')) {
    payload.AllocationManagers = sanitize(uiFilters?.allocationManager);
  }
  if (isFilterEnabled(reportType, 'resourceType')) {
    payload.ResourceTypes = sanitize(uiFilters?.resourceType);
  }

  // Always add new filters (not conditionally enabled yet)
  if (isFilterEnabled(reportType, 'resourceStatuses')) {
    payload.ResourceStatuses = sanitize(uiFilters?.resourceStatuses);
  }
  if (isFilterEnabled(reportType, 'resourceLocations')) {
    payload.ResourceLocations = sanitize(uiFilters?.resourceLocations);
  }
  if (isFilterEnabled(reportType, 'resourceWorkLocationGroup')) {
    payload.ResourceWorkLocationGroup = sanitize(uiFilters?.resourceWorkLocationGroup);
  }
  if (isFilterEnabled(reportType, 'projectStatuses')) {
    payload.ProjectStatuses = sanitize(uiFilters?.projectStatuses);
  }
  return payload;
};

/** Fetch report data */
export const fetchReportData = async (reportType: string, payload: DashboardFilterPayload): Promise<any[]> => {
  const endpoint = REPORT_API_MAPPING[reportType];
  if (!endpoint) throw new Error(`Unknown report type: ${reportType}`);
  
  const response = await apiClient.post(endpoint, payload);
  // Backend response shape standardization
  const data = Array.isArray(response?.data?.result) ? response.data.result : response?.data || [];
  return data;
};

/**
 * Extract chart-specific data from grouped API response
 */
const extractChartData = (chartKey: string, apiResponse: any): any[] => {
  if (!apiResponse || apiResponse.length === 0) return [];

  const responseData = apiResponse[0];

  switch (chartKey) {
    case 'activeProjects':
      return responseData.active_project ? [responseData.active_project] : [];
    
    case 'systemActiveProjects':
      return responseData.system_active_project ? [responseData.system_active_project] : [];
    
    case 'activeProjectsByType':
      return responseData.projects_by_type || [];
    
    case 'activeResources':
      return responseData.active_resource ? [responseData.active_resource] : [];
    
    case 'resourceFTEContractorRatio':
      return responseData.shore_split || [];
    
    case 'totalHeadcount':
      return responseData.total_head_breakdown || [];
    
    default:
      // For non-grouped charts, return the full response
      return apiResponse;
  }
};

/**
 * Fetch dashboard chart data using the new filter-based API approach
 */
export const fetchDashboardChartData = async (
  chartKey: string,
  filters: DashboardFilterPayload
): Promise<any[]> => {
  const endpoint = CHART_API_MAPPING[chartKey];
  
  if (!endpoint) {
    throw new Error(`No API endpoint mapped for chart: ${chartKey}`);
  }

  // Build chart-specific payload
  const payload = buildChartPayload(chartKey, filters);

  try {
    const response = await apiClient.post(endpoint, payload);
    const rawData = response.data || [];
    
    // Extract chart-specific data for grouped endpoints
    return extractChartData(chartKey, rawData);
  } catch (error) {
    console.error(`Error fetching dashboard chart data for ${chartKey}:`, error);
    throw error;
  }
};

/**
 * Batch fetch multiple charts from the same query group
 */
export const fetchDashboardChartsByGroup = async (payload: DashboardFilterPayload) => {
  const response = await axiosInstance.post(
        '/Resource/ExecuteResourceProjectInventoryMetricsQuery',
        payload
      );
  
  return response.data || [];
};
