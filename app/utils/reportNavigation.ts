/**
 * Utility functions for navigating to the report page with filters from dashboard charts
 */

import { compressToEncodedURIComponent } from "lz-string";

export interface ChartReportConfig {
  reportType: string;
  period?: string;
  customStartDate?: string;
  customEndDate?: string;
  additionalFilters?: Record<string, string | string[]>;
  show_actuals?: string;
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
  if (config.customStartDate || config.additionalFilters?.customStartDate) {
    const startDate = config.customStartDate || config.additionalFilters?.customStartDate;
    if (startDate && typeof startDate === 'string') {
      params.set('customStartDate', startDate);
    }
  }
  if (config.customEndDate || config.additionalFilters?.customEndDate) {
    const endDate = config.customEndDate || config.additionalFilters?.customEndDate;
    if (endDate && typeof endDate === 'string') {
      params.set('customEndDate', endDate);
    }
  }

  if(config.show_actuals) {
    params.set('show_actuals', config.show_actuals);
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
  const encodedParams = compressToEncodedURIComponent(
    params.toString()
  );

  if(config.reportType === 'percentageAllocation' || config.reportType === 'allocationCapacity') {
    return `/report?tab=custom&filters=${encodedParams}`;
  }
  return `/report?tab=reports&filters=${encodedParams}`;
};

/**
 * Navigate to the report page with filters
 * @param advancedFilters - The advanced filters applied to the dashboard
 * @param config - Chart-specific configuration
 * @param newTab - Whether to open in a new tab (default: false)
 * @param router - Next.js router instance for client-side navigation (optional)
 */
export const navigateToReport = (
  advancedFilters: Record<string, any>,
  config: ChartReportConfig,
  newTab: boolean = false,
  router?: { push: (url: string) => void }
): void => {
  const url = buildReportUrl(advancedFilters, config);
  
  if (newTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else if (router) {
    // Use Next.js router for client-side navigation (no page reload)
    router.push(url);
  } else {
    // Fallback to full page navigation
    window.location.href = url;
  }
};
