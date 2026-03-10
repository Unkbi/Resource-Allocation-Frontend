import { ReportType } from '@/app/types/dashboardTypes';

// Define which filters are enabled for each report type
export type FilterKey =
  | 'period'
  | 'team'
  | 'organization'
  | 'resourceType'
  | 'resource'
  | 'projectType'
  | 'projectTypeGroup'
  | 'project'
  | 'portfolio'
  | 'projectManager'
  | 'allocationManager'
  | 'resourceStatuses'
  | 'resourceLocations'
  | 'resourceWorkLocationGroup'
  | 'projectStatuses'
  | 'userStatuses'
  | 'userRoles';

export interface ReportFilterConfig {
  enabledFilters: FilterKey[];
  requiresPeriod: boolean; // Whether period is required/enabled
}

export const REPORT_FILTER_CONFIG: Record<ReportType, ReportFilterConfig> = {
  // All filters enabled
  resourceProjectPeriodCost: {
    enabledFilters: [
      'period',
      'team',
      'organization',
      'resourceType',
      'resource',
      'projectType',
      'projectTypeGroup',
      'project',
      'portfolio',
      'projectManager',
      'allocationManager',
      'resourceStatuses',
      'resourceLocations',
      'resourceWorkLocationGroup',
      'projectStatuses',
    ],
    requiresPeriod: true,
  },

  // All filters enabled
  resourceProjectPeriod: {
    enabledFilters: [
      'period',
      'team',
      'organization',
      'resourceType',
      'resource',
      'projectType',
      'projectTypeGroup',
      'project',
      'portfolio',
      'projectManager',
      'allocationManager',
      'resourceStatuses',
      'resourceLocations',
      'resourceWorkLocationGroup',
      'projectStatuses',
    ],
    requiresPeriod: true,
  },

  // Resource-focused filters only
  resourcePeriod: {
    enabledFilters: [
      'period',
      'resource',
      'resourceType',
      'team',
      'organization',
      'allocationManager',
      'resourceStatuses',
      'resourceLocations',
      'resourceWorkLocationGroup',
    ],
    requiresPeriod: true,
  },

  // Project-focused filters only
  projectPeriod: {
    enabledFilters: [
      'period',
      'projectTypeGroup',
      'projectType',
      'project',
      'portfolio',
      'projectManager',
      'projectStatuses',
    ],
    requiresPeriod: true,
  },

  // Resource filters, no period
  resourceOnly: {
    enabledFilters: [
      'resource',
      'resourceType',
      'team',
      'organization',
      'allocationManager',
      'resourceStatuses',
      'resourceLocations',
      'resourceWorkLocationGroup',
    ],
    requiresPeriod: false,
  },

  // Project filters, no period
  projectsOnly: {
    enabledFilters: [
      'projectTypeGroup',
      'projectType',
      'project',
      'portfolio',
      'projectManager',
      'projectStatuses',
    ],
    requiresPeriod: false,
  },

  // Percentage allocation specific filters
  percentageAllocation: {
    enabledFilters: [
      'team',
      'organization',
      'projectType',
      'projectTypeGroup',
      'project',
    ],
    requiresPeriod: true,
  },

  // Allocation capacity specific filters
  allocationCapacity: {
    enabledFilters: [
      'team',
      'organization',
      'projectType',
      'projectTypeGroup',
      'project',
    ],
    requiresPeriod: true,
  },
  // User Activity filters, no period
  userActivity: {
    enabledFilters: [
      'resource',
      'resourceType',
      'team',
      'organization',
      'allocationManager',
      'resourceStatuses',
      'resourceLocations',
      'resourceWorkLocationGroup',
      'userStatuses',
      'userRoles',
    ],
    requiresPeriod: false,
  },

  // AI Summary filters
  aisummary: {
    enabledFilters: [
      'period',
      'projectType',
      'projectTypeGroup',
      'project',
      'projectManager',
      'portfolio',
    ],
    requiresPeriod: true,
  },
};

/**
 * Check if a filter is enabled for the given report type
 */
export const isFilterEnabled = (reportType: ReportType, filterKey: FilterKey): boolean => {
  const config = REPORT_FILTER_CONFIG[reportType];
  return config?.enabledFilters.includes(filterKey) ?? false;
};

/**
 * Check if period is required for the given report type
 */
export const isPeriodRequired = (reportType: ReportType): boolean => {
  const config = REPORT_FILTER_CONFIG[reportType];
  return config?.requiresPeriod ?? true;
};

/**
 * Get all enabled filters for a report type
 */
export const getEnabledFilters = (reportType: ReportType): FilterKey[] => {
  const config = REPORT_FILTER_CONFIG[reportType];
  return config?.enabledFilters ?? [];
};
