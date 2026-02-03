import { SummaryType } from '@/app/types/dashboardTypes';

// Define which filters are enabled for each summary type
export type SummaryFilterKey =
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
  | 'projectStatuses';

export interface SummaryFilterConfig {
  enabledFilters: SummaryFilterKey[];
  requiresPeriod: boolean; // Whether period is required/enabled
}

export const SUMMARY_FILTER_CONFIG: Record<SummaryType, SummaryFilterConfig> = {
  // Project summary - show project-focused filters
  project: {
    enabledFilters: [
      'period',
      'projectManager',
      'project',
      'projectType',
      'projectTypeGroup',
      'portfolio',
      'projectStatuses',
    ],
    requiresPeriod: true,
  },

  // Team summary - show team-focused filters
  team: {
    enabledFilters: [
      'period',
      'team',
      'organization',
      'allocationManager',
    ],
    requiresPeriod: true,
  },
};

/**
 * Check if a filter is enabled for the given summary type
 */
export const isSummaryFilterEnabled = (summaryType: SummaryType, filterKey: SummaryFilterKey): boolean => {
  const config = SUMMARY_FILTER_CONFIG[summaryType];
  return config?.enabledFilters.includes(filterKey) ?? false;
};

/**
 * Check if period is required for the given summary type
 */
export const isSummaryPeriodRequired = (summaryType: SummaryType): boolean => {
  const config = SUMMARY_FILTER_CONFIG[summaryType];
  return config?.requiresPeriod ?? true;
};

/**
 * Get all enabled filters for a summary type
 */
export const getSummaryEnabledFilters = (summaryType: SummaryType): SummaryFilterKey[] => {
  const config = SUMMARY_FILTER_CONFIG[summaryType];
  return config?.enabledFilters ?? [];
};
