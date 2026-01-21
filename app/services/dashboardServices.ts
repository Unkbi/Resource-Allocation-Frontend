import axiosInstance from '../utils/apiClient';
import apiClient from '../utils/apiClient';
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

  // Compute date range only if period is required
  let StartDate: string | undefined;
  let EndDate: string | undefined;
  const today = new Date();

  // Format as YYYY-MM-DD in local time to avoid timezone shifts
  const toISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
    date.setDate(date.getDate() + diff);
    return date;
  };

  const endOfWeek = (monday: Date) => {
    const e = new Date(monday);
    e.setDate(e.getDate() + 6);
    return e;
  };

  const firstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const firstDayOfQuarter = (d: Date) => {
    const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3; // 0, 3, 6, 9
    return new Date(d.getFullYear(), quarterStartMonth, 1);
  };

  const lastDayOfQuarter = (d: Date) => {
    const quarterStartMonth = Math.floor(d.getMonth() / 3) * 3;
    const nextQuarterStartMonth = quarterStartMonth + 3;
    // Day 0 of next quarter's first month = last day of current quarter
    return new Date(d.getFullYear(), nextQuarterStartMonth, 0);
  };

  const firstDayOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
  const lastDayOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31);
  
  switch (period) {
    case 'this_week': {
      const mon = getMonday(today);
      StartDate = toISO(mon);
      EndDate = toISO(endOfWeek(mon));
      break;
    }
    case 'last_week': {
      const mon = getMonday(today);
      mon.setDate(mon.getDate() - 7);
      StartDate = toISO(mon);
      EndDate = toISO(endOfWeek(mon));
      break;
    }
    case 'this_month': {
      const start = firstDayOfMonth(today);
      const end = lastDayOfMonth(today);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'last_month': {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const start = firstDayOfMonth(prev);
      const end = lastDayOfMonth(prev);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'this_quarter': {
      const start = firstDayOfQuarter(today);
      const end = lastDayOfQuarter(today);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'last_quarter': {
      const prevQuarterRef = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      const start = firstDayOfQuarter(prevQuarterRef);
      const end = lastDayOfQuarter(prevQuarterRef);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'this_year': {
      const start = firstDayOfYear(today);
      const end = lastDayOfYear(today);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'last_year': {
      const prevYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const start = firstDayOfYear(prevYear);
      const end = lastDayOfYear(prevYear);
      StartDate = toISO(start);
      EndDate = toISO(end);
      break;
    }
    case 'custom': {
      // Support both plain YYYY-MM-DD and full ISO strings, normalizing to local date
      if (customStart) {
        StartDate = customStart.length > 10 ? toISO(new Date(customStart)) : customStart;
      }
      if (customEnd) {
        EndDate = customEnd.length > 10 ? toISO(new Date(customEnd)) : customEnd;
      }
      break;
    }
    default: {
      const mon = getMonday(today);
      StartDate = toISO(mon);
      EndDate = toISO(endOfWeek(mon));
    }
  }

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
