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

// Map chart keys to their API endpoints based on the query groups
const CHART_API_MAPPING: Record<string, string> = {
  // Group 1: Resource Project Inventory Metrics - Single API call for all 5 charts
  activeProjects: '/Resource/ExecuteResourceProjectInventoryMetricsQuery',
  activeProjectsByType: '/Resource/ExecuteResourceProjectInventoryMetricsQuery',
  activeResources: '/Resource/ExecuteResourceProjectInventoryMetricsQuery',
  resourceFTEContractorRatio: '/Resource/ExecuteResourceProjectInventoryMetricsQuery',
  totalHeadcount: '/Resource/ExecuteResourceProjectInventoryMetricsQuery',
  
  // Group 2: Team Capacity Utilization Analytics
  capacityAvailability: '/Resource/ExecuteTeamCapacityUtilizationAnalyticsQuery',
  resourceCoverage: '/Resource/ExecuteTeamCapacityUtilizationAnalyticsQuery',
  resourceUtilization: '/Resource/ExecuteTeamCapacityUtilizationAnalyticsQuery',
  
  // Group 3: Actual Hours Work Distribution
  unapprovedProjectActualsByTeam: '/Resource/ExecuteActualHoursWorkDistributionQuery',
  unapprovedProjectAllocation: '/Resource/ExecuteActualHoursWorkDistributionQuery',
  
  // Group 4: Cost Budget Variance Analytics
  budgetVsPlanVsActual: '/Resource/ExecuteCostBudgetVarianceAnalyticsQuery',
  totalResourceCost: '/Resource/ExecuteCostBudgetVarianceAnalyticsQuery',
  
  // Group 5: Allocation Percentage Project FTE Metrics
  allocationPercentage: '/Resource/ExecuteAllocationPercentageProjectFTEMetricsQuery',
  projectFTE: '/Resource/ExecuteAllocationPercentageProjectFTEMetricsQuery',
  
  // Group 6: Actuals Status Plan Deviation Analytics
  actualsConfirmed: '/Resource/ExecuteActualsStatusPlanDeviationAnalyticsQuery',
  resourceActualsDeviation: '/Resource/ExecuteActualsStatusPlanDeviationAnalyticsQuery',
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
    // Group 1: Resource Project Inventory Metrics
    activeProjects: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      StatusFilter: "AND proj.\"Status\" IN ('Active','Approved') ",
      SelectColumns: '',
      OrderByClause: '1',
      ...baseFilters,
    },
    activeProjectsByType: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      StatusFilter: "AND proj.\"Status\" IN ('Active','Approved') ",
      SelectColumns: '',
      OrderByClause: '1',
      ...baseFilters,
    },
    activeResources: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      StatusFilter: "AND proj.\"Status\" IN ('Active','Approved') ",
      SelectColumns: '',
      OrderByClause: '1',
      ...baseFilters,
    },
    resourceFTEContractorRatio: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      StatusFilter: "AND proj.\"Status\" IN ('Active','Approved') ",
      SelectColumns: '',
      OrderByClause: '1',
      ...baseFilters,
    },
    totalHeadcount: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      StatusFilter: "AND proj.\"Status\" IN ('Active','Approved') ",
      SelectColumns: '',
      OrderByClause: '1',
      ...baseFilters,
    },

    // Group 2: Team Capacity Utilization Analytics
    capacityAvailability: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'capacity',
      ExcludedResourceType: 'Contractor - PT',
      ...baseFilters,
      OverAllocThreshold: 100,
      UnderAllocThreshold: 80,
      SelectColumns: '',
      OrderByClause: 'team_name, period_start',
      DynamicWhere: '',
    },
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
      SelectColumns: 'ft.team_name, cal.period_start, cat.category, cat.units, ROUND(CASE WHEN bt.total_actuals = 0 THEN 0 ELSE ((cat.units::numeric / NULLIF(bt.total_actuals, 0)::numeric) * 100)::numeric END, 2) AS pct_of_actuals',
      OrderByClause: 'ft.team_name, cal.period_start, cat.category',
      DynamicWhere: '',
    },
    unapprovedProjectAllocation: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      GroupByDimension: 'tm.team_id',
      ...baseFilters,
      SelectColumns: 'ft.team_name, cal.period_start, SUM(CASE WHEN cat.category = \'Unplanned Projects\' THEN cat.units ELSE 0 END)::numeric AS unapproved_actual_units',
      OrderByClause: 'ft.team_name, cal.period_start',
      DynamicWhere: '',
      GroupByClause: 'ft.team_name, cal.period_start',
    },

    // Group 4: Cost Budget Variance Analytics
    budgetVsPlanVsActual: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      AnalysisType: 'budget_comparison',
      ...baseFilters,
      ExcludedResourceType: '',
      DynamicWhere: 'AND x.analysis_type = \'budget_comparison\'',
    },
    totalResourceCost: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      AnalysisType: 'total_cost',
      ...baseFilters,
      ExcludedResourceType: '',
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
      SelectColumns: 'period_start, headcount, allocated_units, metric_value AS pct_allocated',
      OrderByClause: 'period_start',
      DynamicWhere: 'AND metric_type = \'allocation_percentage\'',
    },
    projectFTE: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'project_fte',
      ...baseFilters,
      ExcludedResourceType: 'Contractor - PT',
      ExcludedProjectTypes: '',
      SelectColumns: 'project_type, period_start, metric_value AS avg_weekly_fte',
      OrderByClause: 'project_type, period_start',
      DynamicWhere: 'AND metric_type = \'project_fte\'',
    },

    // Group 6: Actuals Status Plan Deviation Analytics
    actualsConfirmed: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'actuals_confirmed',
      ...baseFilters,
      ExcludedResourceType: '',
      SelectColumns: 'period_start, period_end, total_rows, confirmed_rows, pct_confirmed',
      OrderByClause: 'period_start',
      DynamicWhere: 'AND metric_type = \'actuals_confirmed\'',
    },
    resourceActualsDeviation: {
      StartDate: filters.StartDate,
      EndDate: filters.EndDate,
      TimeBucket: filters.TimeBucket || 'week',
      MetricType: 'actuals_deviation',
      ...baseFilters,
      ExcludedResourceType: '',
      SelectColumns: 'period_start, deviation_pct, in_plan_pct',
      OrderByClause: 'period_start',
      DynamicWhere: 'AND metric_type = \'actuals_deviation\'',
    },
  };
console.log(payloadConfigs[chartKey],"config chartkey");
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
      return responseData.resource_type_split || [];
    
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
export const fetchDashboardChartsByGroup = async (
  chartKeys: string[],
  filters: DashboardFilterPayload
): Promise<Record<string, any[]>> => {
  // Group charts by their API endpoint
  const groupedCharts: Record<string, string[]> = {};
  
  chartKeys.forEach(chartKey => {
    const endpoint = CHART_API_MAPPING[chartKey];
    if (endpoint) {
      if (!groupedCharts[endpoint]) {
        groupedCharts[endpoint] = [];
      }
      groupedCharts[endpoint].push(chartKey);
    }
  });

  // Fetch each group once
  const results: Record<string, any[]> = {};
  
  for (const [endpoint, charts] of Object.entries(groupedCharts)) {
    try {
      const data = await fetchDashboardChartData(charts[0], filters);
      // Assign the same data to all charts in this group
      charts.forEach(chartKey => {
        results[chartKey] = data;
      });
    } catch (error) {
      console.error(`Error fetching chart group for endpoint ${endpoint}:`, error);
      // Set empty array for failed charts
      charts.forEach(chartKey => {
        results[chartKey] = [];
      });
    }
  }
  
  return results;
};
