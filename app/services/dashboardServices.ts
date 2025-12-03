import axiosInstance from '../utils/apiClient';
import apiClient from '../utils/apiClient';

export interface DashboardFilterPayload {
  StatusFilter?: string;
  Teams?: string[];
  Orgs?: string[] | null;
  ProjectTypes?: string[] | null;
  Portfolios?: string[] | null;
  ProjectManagers?: string[];
  Resources?: string[];
  AllocationManagers?: string[];
  ProjectTypeGroups?: string[];
  Projects?: string[];
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
      EndDate: '',
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

  };
  return payloadConfigs[chartKey] || baseFilters;
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
