/**
 * Utility functions for navigating to the report page with filters from dashboard charts
 */

export interface ChartReportConfig {
  reportType: string;
  period?: string;
  customStartDate?: string;
  customEndDate?: string;
  additionalFilters?: Record<string, string | string[]>;
}

/**
 * Builds the report URL with query parameters from advanced filters and chart-specific data
 * @param advancedFilters - The advanced filters applied to the dashboard
 * @param config - Chart-specific configuration including reportType, period, and clicked value
 * @returns The URL to navigate to
 */
export const buildReportUrl = (
  advancedFilters: Record<string, any>,
  config: ChartReportConfig
): string => {
  const params = new URLSearchParams();

  // Add advanced filters to query params
  Object.entries(advancedFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, JSON.stringify(value));
        }
      } else if (value !== '') {
        params.set(key, String(value));
      }
    }
  });

  // Add report type
  if (config.reportType) {
    params.set('reportType', config.reportType);
  }

  // Add period
  if (config.period) {
    params.set('period', config.period);
  }

  // Add custom date range
  if (config.customStartDate) {
    params.set('customStartDate', config.customStartDate);
  }
  if (config.customEndDate) {
    params.set('customEndDate', config.customEndDate);
  }

  // Add additional filters from chart clicks
  if (config.additionalFilters) {
    Object.entries(config.additionalFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, JSON.stringify(value));
        }
      } else if (value) {
        params.set(key, JSON.stringify([value]));
      }
    });
  }

  return `/report?${params.toString()}`;
};

/**
 * Navigate to the report page with filters
 * @param advancedFilters - The advanced filters applied to the dashboard
 * @param config - Chart-specific configuration
 * @param newTab - Whether to open in a new tab (default: true)
 */
export const navigateToReport = (
  advancedFilters: Record<string, any>,
  config: ChartReportConfig,
  newTab: boolean = true
): void => {
  const url = buildReportUrl(advancedFilters, config);
  
  if (newTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
};
