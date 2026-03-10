'use client';

import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import ReportBuilderToolbar from './ReportBuilderToolbar';
import ReportBuilderFilters, { ReportFilters } from './ReportBuilderFilters';
import ReportBuilderDataGridToolbar from './ReportBuilderDataGridToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReport } from '@/app/redux/actions/dashboardAction';
import { RootState } from '@/app/redux/store';
import {
  ReportType,
  ReportUIFilters,
  SummaryType,
} from '@/app/types/dashboardTypes';
import { getReportColumns, getHiddenColumns } from './reportColumns';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  ColumnManagementStyles,
  StyledDataGrid,
} from '../../AllocationTable/styles/StyledDataGrid';

dayjs.extend(isoWeek);
import { showToast } from '@/app/redux/reducers/toastReducer';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import LoadingScreen from '@/app/components/Loading/loadingScreen';
import AISummaryTab from './AISummaryTab';
import CustomTab from './CustomTab';
import { fetchProjectSummary } from '@/app/redux/actions/aiSummaryAction';
import { fetchCustomReportRequest, fetchAllocationCapacityRequest } from '@/app/redux/actions/customReportActions';
import { decompressFromEncodedURIComponent } from 'lz-string';
import ErrorPage from '../../ErrorPage/ErrorPage';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import { FETCH_SAVED_REPORTS, fetchSavedReports } from '@/app/redux/actions/savedReportsActions';
import { setCurrentLoadedReport } from '@/app/redux/reducers/savedReportsReducer';
import { calculateDateRange } from '@/app/utils/dateUtils';

interface ReportBuilderProps {
  onReportGenerate?: (filters: ReportFilters) => void;
  permissions?: Record<string, CrudPermissions>;
  loadingPermissions?: boolean;
}

/**
 * Parse query params and convert them to filter values
 */
const parseQueryParams = (
  searchParams: URLSearchParams
): Partial<ReportFilters> & {
  customStartDate?: string;
  customEndDate?: string;
} => {
  const filters: Partial<ReportFilters> & {
    customStartDate?: string;
    customEndDate?: string;
  } = {};

  // Helper to parse JSON array or return empty array
  const parseArrayParam = (param: string | null): string[] => {
    if (!param) return [];
    try {
      const parsed = JSON.parse(param);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Parse reportType
  const reportType = searchParams.get('reportType');
  if (reportType) {
    filters.reportType = reportType as ReportType;
  }

  // Parse period
  const period = searchParams.get('period');
  if (period) {
    filters.period = period;
  }

  // Parse array filters from advanced filters
  const projectTypeGroup =
    searchParams.get('projectTypeGroup') ||
    searchParams.get('ProjectTypeGroup');
  if (projectTypeGroup) {
    filters.projectTypeGroup = parseArrayParam(projectTypeGroup);
  }

  const projectType =
    searchParams.get('projectType') || searchParams.get('ProjectType');
  if (projectType) {
    filters.projectType = parseArrayParam(projectType);
  }

  const team = searchParams.get('team') || searchParams.get('Team');
  if (team) {
    filters.team = parseArrayParam(team);
  }

  const resource = searchParams.get('resource') || searchParams.get('Resource');
  if (resource) {
    filters.resource = parseArrayParam(resource);
  }

  const organization =
    searchParams.get('organization') || searchParams.get('Organization');
  if (organization) {
    filters.organization = parseArrayParam(organization);
  }

  const portfolio =
    searchParams.get('portfolio') || searchParams.get('Portfolio');
  if (portfolio) {
    filters.portfolio = parseArrayParam(portfolio);
  }

  const project = searchParams.get('project') || searchParams.get('Project');
  if (project) {
    filters.project = parseArrayParam(project);
  }

  const projectManager =
    searchParams.get('projectManager') || searchParams.get('ProjectManager');
  if (projectManager) {
    filters.projectManager = parseArrayParam(projectManager);
  }

  const allocationManager =
    searchParams.get('allocationManager') ||
    searchParams.get('AllocationManager');
  if (allocationManager) {
    filters.allocationManager = parseArrayParam(allocationManager);
  }

  const resourceType =
    searchParams.get('resourceType') || searchParams.get('ResourceType');
  if (resourceType) {
    filters.resourceType = parseArrayParam(resourceType);
  }

  const resourceStatuses =
    searchParams.get('resourceStatuses') ||
    searchParams.get('ResourceStatuses');
  if (resourceStatuses) {
    filters.resourceStatuses = parseArrayParam(resourceStatuses);
  }

  const resourceLocations =
    searchParams.get('resourceLocations') ||
    searchParams.get('ResourceLocations');
  if (resourceLocations) {
    filters.resourceLocations = parseArrayParam(resourceLocations);
  }
  const resourceWorkLocationGroup =
    searchParams.get('resourceWorkLocationGroup') ||
    searchParams.get('ResourceWorkLocationGroup');
  if (resourceWorkLocationGroup) {
    filters.resourceWorkLocationGroup = parseArrayParam(
      resourceWorkLocationGroup
    );
  }

  const projectStatuses =
    searchParams.get('projectStatuses') || searchParams.get('ProjectStatuses');
  if (projectStatuses) {
    filters.projectStatuses = parseArrayParam(projectStatuses);
  }

  const userStatuses =
    searchParams.get('userStatuses') || searchParams.get('UserStatuses');
  if (userStatuses) {
    filters.userStatuses = parseArrayParam(userStatuses);
  }

  const userRoles =
    searchParams.get('userRoles') || searchParams.get('UserRoles');
  if (userRoles) {
    filters.userRoles = parseArrayParam(userRoles);
  }

  // Parse custom date range
  const customStartDate = searchParams.get('customStartDate');
  const customEndDate = searchParams.get('customEndDate');
  if (customStartDate && customEndDate) {
    filters.customStartDate = customStartDate;
    filters.customEndDate = customEndDate;
  }

  const showActuals = searchParams.get('show_actuals');
  if (showActuals === 'true') {
    filters.show_actuals = true;
  }

  return filters;
};

function ReportBuilderPage({
  onReportGenerate,
  permissions,
  loadingPermissions,
}: ReportBuilderProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasQueryParams = Boolean(searchParams && searchParams.toString());

  // Get active tab from URL or default to 'reports'
  const activeTabFromUrl = searchParams?.get('tab') || 'reports';
  const [activeTab, setActiveTab] = useState<string>(activeTabFromUrl);

  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Separate filter states for Reports and AI Summary
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'resourceProjectPeriod',
    period: 'last_week',
    customDateRange: undefined,
    team: [],
    organization: [],
    resourceType: [],
    resource: [],
    projectType: [],
    projectTypeGroup: [],
    project: [],
    portfolio: [],
    projectManager: [],
    allocationManager: [],
    resourceStatuses: [],
    resourceLocations: [],
    resourceWorkLocationGroup: [],
    projectStatuses: [],
    userStatuses: [],
    userRoles: [],
  });

  // Separate filter state for AI Summary tab
  const [summaryFilters, setSummaryFilters] = useState<ReportFilters>({
    reportType: 'resourceProjectPeriod', // Dummy value, not used in summary mode
    summaryType: 'project', // Default to project summary
    period: 'last_week',
    customDateRange: undefined,
    team: [],
    organization: [],
    resourceType: [],
    resource: [],
    projectType: [],
    projectTypeGroup: [],
    project: [],
    portfolio: [],
    projectManager: [],
    allocationManager: [],
    resourceStatuses: [],
    resourceLocations: [],
    resourceWorkLocationGroup: [],
    projectStatuses: [],
    userStatuses: [],
    userRoles: [],
  });

  // Separate filter state for Custom tab
  const [customFilters, setCustomFilters] = useState<ReportFilters>({
    reportType: 'percentageAllocation', // Dummy value
    period: 'last_week',
    customDateRange: undefined,
    team: [],
    organization: [],
    resourceType: [],
    resource: [],
    projectType: [],
    projectTypeGroup: [],
    project: [],
    portfolio: [],
    projectManager: [],
    allocationManager: [],
    resourceStatuses: [],
    resourceLocations: [],
    resourceWorkLocationGroup: [],
    projectStatuses: [],
    userStatuses: [],
    userRoles: [],
    show_actuals: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showData, setShowData] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [SavedReports, setSavedReports] = useState<
    {
      name: string;
      reportType: ReportType;
      uiFilters: ReportUIFilters;
      createdAt: string;
    }[]
  >([]);
  const [isFullscreenGrid, setIsFullscreenGrid] = useState(false);
  const [pendingQueryFilters, setPendingQueryFilters] = useState<
    | (Partial<ReportFilters> & {
        customStartDate?: string;
        customEndDate?: string;
      })
    | null
  >(null);
  const [hasAppliedQueryParams, setHasAppliedQueryParams] = useState(false);
  const [isInitializing, setIsInitializing] = useState(hasQueryParams);
  const [noAccess, setNoAccess] = useState(false);
  const [lastAppliedFiltersParam, setLastAppliedFiltersParam] = useState<
    string | null
  >(null);

  const reportSlice = useSelector((state: RootState) => state.dashboard.report);
  const currentReport = reportSlice?.[filters.reportType as ReportType];
  const aiSummaryState = useSelector((state: RootState) => state.aiSummary);
  
  // Get saved reports from Redux
  const { savedReports, loading: savedReportsLoading } = useSelector((state: RootState) => state.savedReports);
  
  const customReportState = useSelector(
    (state: RootState) => state.customReport
  );

  // Get Redux data to check if it's loaded
  const { projectTypeGroups, projectTypes } = useSelector(
    (state: RootState) => state.allSettings
  );
  const { portfolios } = useSelector((state: RootState) => state.portfolios);
  const { teams } = useSelector((state: RootState) => state.teams);
  const { resources } = useSelector((state: RootState) => state.resources);
  const { user: userData } = useSelector((state: RootState) => state.user as any);
  const { organisations } = useSelector(
    (state: RootState) => state.organisations
  );
  const { projects } = useSelector((state: RootState) => state.projects);

  const [APIFilters, setAPIFilters] = useState<any>(null);
  const [customReportType, setCustomReportType] = useState<'percentageAllocation' | 'allocationCapacity'>('percentageAllocation');

  // Ref to track if we've already attempted initial sessionStorage load
  const hasAttemptedInitialLoadRef = useRef(false);

  // Check if all necessary data is loaded
  const isDataLoaded =
    (teams?.length ?? 0) > 0 &&
    (resources?.length ?? 0) > 0 &&
    (projects?.length ?? 0) > 0 &&
    (projectTypes?.length ?? 0) > 0 &&
    (projectTypeGroups?.length ?? 0) > 0 &&
    (organisations?.length ?? 0) > 0 &&
    (portfolios?.length ?? 0) > 0;

  // Helper function to prepare API payload from filters
  const prepareApiPayload = (filters: ReportUIFilters) => {
    const payload: any = {
      reportType: filters.reportType,
    };

    // Process each filter - exclude 'all' values for API
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'reportType' || key === 'customDateRange') return; // Already handled

      if (Array.isArray(value)) {
        // Filter out 'all' and only include if there are actual selections
        const filtered = value.filter(v => v !== 'all');
        if (filtered.length > 0) {
          payload[key] = filtered;
        }
      } else if (value && value !== 'all') {
        payload[key] = value;
      }
    });

    return payload;
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setShowData(false);
    setFiltersExpanded(false);
    
    // Clear the loaded report since we're generating a new one
    dispatch(setCurrentLoadedReport(null));

    // Serialize custom date range for UI filters stored in redux
    const [start, end] = filters.customDateRange || [];
    const uiFilters: ReportUIFilters = {
      reportType: filters.reportType as ReportType,
      period: filters.period as ReportUIFilters['period'],
      customStartDate: start ? start.format('YYYY-MM-DD') : '',
      customEndDate: end ? end.format('YYYY-MM-DD') : '',
      team: filters.team,
      organization: filters.organization,
      resourceType: filters.resourceType,
      resource: filters.resource,
      projectType: filters.projectType,
      projectTypeGroup: filters.projectTypeGroup,
      project: filters.project,
      portfolio: filters.portfolio,
      projectManager: filters.projectManager,
      allocationManager: filters.allocationManager,
      resourceStatuses: filters.resourceStatuses,
      resourceLocations: filters.resourceLocations,
      resourceWorkLocationGroup: filters.resourceWorkLocationGroup,
      projectStatuses: filters.projectStatuses,
      userStatuses: filters.userStatuses,
      userRoles: filters.userRoles,
    };
    const apiPayload = prepareApiPayload(uiFilters);
    try {
      dispatch(
        fetchReport({ reportType: uiFilters.reportType, uiFilters: apiPayload })
      );
      setShowData(true);
      // Save the last generated report to sessionStorage
      sessionStorage.setItem(
        'last_generated_report',
        JSON.stringify({ uiFilters })
      );
    } catch (error) {
      console.error('Error generating report:', error);
      dispatch(
        showToast({
          message: 'Failed to generate report. Please try again.',
          severity: 'error',
        })
      );
      setIsLoading(false);
      setShowData(false);
    }
    onReportGenerate?.(filters);
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setShowData(false);
    setFiltersExpanded(false);
    
    // Clear the loaded report since we're generating a new one
    dispatch(setCurrentLoadedReport(null));

    if (summaryFilters.summaryType === 'project') {
      // Serialize custom date range for UI filters
      const [start, end] = summaryFilters.customDateRange || [];

      const uiFilters: any = {
        customStartDate: start ? start.format('YYYY-MM-DD') : undefined,
        customEndDate: end ? end.format('YYYY-MM-DD') : undefined,
        ...summaryFilters,
      };

      // Saga will handle date calculation and payload building
      try {
        dispatch(fetchProjectSummary(uiFilters));
        setShowData(true);
      } catch (error) {
        console.error('Error generating AI summary:', error);
        dispatch(
          showToast({
            message: 'Failed to generate AI summary. Please try again.',
            severity: 'error',
          })
        );
        setIsLoading(false);
        setShowData(false);
      }
    }
    // else if (summaryFilters.summaryType === 'team') {
    //   dispatch(fetchTeamSummary({ filters: summaryFilters }));
    // }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting as ${format}...`);
    // TODO: Implement export logic
  };

  const handleShare = () => {
    console.log('Sharing report...');
    // TODO: Implement share logic
  };

  const handleFiltersChange = (newFilters: ReportFilters) => {
    // Reset report generated state if report type changes
    if (newFilters.reportType !== filters.reportType) {
      setReportGenerated(false);
      setShowData(false);
      setReportData([]);
    }
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      reportType: filters.reportType,
      period: 'last_week',
      customDateRange: undefined,
      team: [],
      organization: [],
      resourceType: [],
      resource: [],
      projectType: [],
      projectTypeGroup: [],
      project: [],
      portfolio: [],
      projectManager: [],
      allocationManager: [],
      resourceStatuses: [],
      resourceLocations: [],
      resourceWorkLocationGroup: [],
      projectStatuses: [],
      userStatuses: [],
      userRoles: [],
    });
  };

  // Handler functions for AI Summary tab
  const handleSummaryFiltersChange = (newFilters: ReportFilters) => {
    setSummaryFilters(newFilters);
  };

  const handleResetSummaryFilters = () => {
    setSummaryFilters({
      reportType: 'resourceProjectPeriod',
      summaryType: summaryFilters.summaryType,
      period: 'last_week',
      customDateRange: undefined,
      team: [],
      organization: [],
      resourceType: [],
      resource: [],
      projectType: [],
      projectTypeGroup: [],
      project: [],
      portfolio: [],
      projectManager: [],
      allocationManager: [],
      resourceStatuses: [],
      resourceLocations: [],
      resourceWorkLocationGroup: [],
      projectStatuses: [],
      userStatuses: [],
      userRoles: [],
    });
  };

  // Handler functions for Custom tab
  const handleGenerateCustomReport = async () => {
    setIsLoading(true);
    setShowData(false);
    setFiltersExpanded(false);
    
    // Clear the loaded report since we're generating a new one
    dispatch(setCurrentLoadedReport(null));

    const customStart = customFilters.customDateRange
      ? customFilters?.customDateRange[0]?.format('MMM DD, YYYY')
      : undefined;
    const customEnd = customFilters.customDateRange
      ? customFilters?.customDateRange[1]?.format('MMM DD, YYYY')
      : undefined;
    // Serialize custom date range
    const { start, end } = calculateDateRange(
      customFilters.period,
      customStart,
      customEnd
    );

    const apiFilters: any = {
      Projects: customFilters.project,
      ProjectTypeGroups: customFilters.projectTypeGroup,
      ProjectTypes: customFilters.projectType,
      Teams: customFilters.team,
      Organizations: customFilters.organization,
      ProjectStatuses: ['Active'],
      StartDate: start || undefined,
      EndDate: end || undefined,
    };

    setAPIFilters(apiFilters);

    // Prepare uiFilters to store in Redux
    const uiFilters = {
      reportType: customReportType,
      period: customFilters.period,
      customStartDate: start,
      customEndDate: end,
      project: customFilters.project,
      projectTypeGroup: customFilters.projectTypeGroup,
      projectType: customFilters.projectType,
      team: customFilters.team,
      organization: customFilters.organization,
      show_actuals: customFilters.show_actuals,
    };

    try {
      if (customReportType === 'allocationCapacity') {
        dispatch(fetchAllocationCapacityRequest(apiFilters, uiFilters));
      } else {
        dispatch(fetchCustomReportRequest(apiFilters, uiFilters));
      }
      setShowData(true);
    } catch (error) {
      console.error('Error generating custom report:', error);
      dispatch(
        showToast({
          message: 'Failed to generate custom report. Please try again.',
          severity: 'error',
        })
      );
      setIsLoading(false);
      setShowData(false);
    }
  };

  const handleCustomFiltersChange = (newFilters: ReportFilters) => {
    setCustomFilters(newFilters);
  };

  const handleResetCustomFilters = () => {
    setCustomFilters({
      reportType: 'resourceProjectPeriod', // Default to resourceProjectPeriod for custom tab
      period: 'last_week',
      customDateRange: undefined,
      team: [],
      organization: [],
      resourceType: [],
      resource: [],
      projectType: [],
      projectTypeGroup: [],
      project: [],
      portfolio: [],
      projectManager: [],
      allocationManager: [],
      resourceStatuses: [],
      resourceLocations: [],
      resourceWorkLocationGroup: [],
      projectStatuses: [],
      userStatuses: [],
      userRoles: [],
      show_actuals: false,
    });
  };

  const getCustomSelectedFiltersCount = () => {
    let count = 0;

    if (customFilters.period && customFilters.period !== 'last_week') {
      count++;
    }

    const arrayFilters: (keyof ReportFilters)[] = [
      'project',
      'projectTypeGroup',
      'projectType',
      'team',
      'organization',
    ];

    arrayFilters.forEach(key => {
      const value = customFilters[key];
      if (Array.isArray(value) && value.length > 0) {
        count++;
      }
    });

    return count;
  };

  const getSummarySelectedFiltersCount = () => {
    let count = 0;

    // Count period if it's not the default
    if (summaryFilters.period && summaryFilters.period !== 'last_week') {
      count++;
    }

    // Count array filters that have selections
    const arrayFilters: (keyof ReportFilters)[] = [
      'projectManager',
      'allocationManager',
      'team',
      'organization',
      'resourceType',
      'resource',
      'projectType',
      'projectTypeGroup',
      'project',
      'portfolio',
      'resourceStatuses',
      'resourceLocations',
      'resourceWorkLocationGroup',
      'projectStatuses',
    ];

    arrayFilters.forEach(key => {
      const value = summaryFilters[key];
      if (Array.isArray(value) && value.length > 0) {
        count++;
      }
    });

    return count;
  };

  // Effect 1: Parse and store query params on mount
  useEffect(() => {
    if (loadingPermissions) return;

    // Priority 1: Check for query params from dashboard navigation
    if (searchParams && searchParams.toString()) {
      // Extract the compressed filters parameter (everything except 'tab')
      const filtersParam = searchParams.get('filters');

      // Check if this is the same filters we already applied
      if (filtersParam && filtersParam === lastAppliedFiltersParam) {
        // Same filters, skip processing
        return;
      }

      const decodedParams = filtersParam
        ? decompressFromEncodedURIComponent(filtersParam) || ''
        : '';
      const queryFilters = parseQueryParams(
        decodedParams
          ? new URLSearchParams(decodedParams)
          : new URLSearchParams()
      );
      if (Object.keys(queryFilters).length > 0) {
        // Filters are present (drill-down scenario) - skip permission checks
        setIsInitializing(true);
        setNoAccess(false);

        // Clear sessionStorage to prevent Effect 3 from loading old report
        sessionStorage.removeItem('last_generated_report');

        // Store query params to apply later when data is loaded
        setPendingQueryFilters(queryFilters);

        // Mark this filters param as processed
        setLastAppliedFiltersParam(filtersParam);

        // Reset the flag so we can process new navigations
        setHasAppliedQueryParams(false);
        // Mark that we're initializing with query params
        return; // Skip loading from sessionStorage
      }
      // Query params exist but no filters - enforce permission checks
      // Define tab to permission mapping
      const tabPermissionMap = [
        { tab: 'reports', permission: 'Reports' },
        { tab: 'aisummary', permission: 'AISummary' },
        { tab: 'custom', permission: 'CustomReports' },
      ];

      // Check if user has access to any tab
      const accessibleTabs = tabPermissionMap.filter(
        ({ permission }) => permissions && permissions[permission]?.r
      );

      // If no access to any tab, deny access
      if (accessibleTabs.length === 0) {
        setNoAccess(true);
        setIsInitializing(false);
        return;
      }

      setNoAccess(false);

      // Check if user has permission for the requested tab
      const requestedTab = searchParams.get('tab') || 'reports';
      const isTabAccessible = accessibleTabs.some(
        ({ tab }) => tab === requestedTab
      );

      if (!isTabAccessible) {
        // Redirect to first accessible tab
        const firstAccessibleTab = accessibleTabs[0].tab;
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('tab', firstAccessibleTab);
        router.replace(`${pathname}?${params.toString()}`);
      }

      // Reset hasAppliedQueryParams to allow Effect 3 to load from sessionStorage
      setHasAppliedQueryParams(false);
      setIsInitializing(false);
      return;
    }

    // No query params present - enforce permission checks
    // Define tab to permission mapping
    const tabPermissionMap = [
      { tab: 'reports', permission: 'Reports' },
      { tab: 'aisummary', permission: 'AISummary' },
      { tab: 'custom', permission: 'CustomReports' },
    ];

    // Check if user has access to any tab
    const accessibleTabs = tabPermissionMap.filter(
      ({ permission }) => permissions && permissions[permission]?.r
    );

    // If no access to any tab, deny access
    if (accessibleTabs.length === 0) {
      setNoAccess(true);
      setIsInitializing(false);
      return;
    }

    setNoAccess(false);
    setIsInitializing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loadingPermissions]);

  // Effect 2: Apply pending query params once data is loaded
  useEffect(() => {
    if (loadingPermissions) return;
    if (!pendingQueryFilters || hasAppliedQueryParams || !isDataLoaded) return;

    // Check which tab we're on
    const currentTab = searchParams?.get('tab') || 'reports';

    // Handle Custom Tab
    if (currentTab === 'custom') {
      // Parse dates for custom tab
      const customStart = pendingQueryFilters.customStartDate
        ? dayjs(pendingQueryFilters.customStartDate).format('MMM DD, YYYY')
        : undefined;
      const customEnd = pendingQueryFilters.customEndDate
        ? dayjs(pendingQueryFilters.customEndDate).format('MMM DD, YYYY')
        : undefined;

      // Calculate date range
      const { start, end } = calculateDateRange(
        pendingQueryFilters.period || 'last_week',
        customStart,
        customEnd
      );

      // Set custom filters from query params
      const customFiltersFromQuery: ReportFilters = {
        reportType: pendingQueryFilters.reportType || 'percentageAllocation',
        period: pendingQueryFilters.period || 'last_week',
        customDateRange:
          pendingQueryFilters.customStartDate && pendingQueryFilters.customEndDate
            ? [
                dayjs(pendingQueryFilters.customStartDate),
                dayjs(pendingQueryFilters.customEndDate),
              ]
            : undefined,
        team: pendingQueryFilters.team || [],
        organization: pendingQueryFilters.organization || [],
        resourceType: pendingQueryFilters.resourceType || [],
        resource: pendingQueryFilters.resource || [],
        projectType: pendingQueryFilters.projectType || [],
        projectTypeGroup: pendingQueryFilters.projectTypeGroup || [],
        project: pendingQueryFilters.project || [],
        portfolio: pendingQueryFilters.portfolio || [],
        projectManager: pendingQueryFilters.projectManager || [],
        allocationManager: pendingQueryFilters.allocationManager || [],
        resourceStatuses: pendingQueryFilters.resourceStatuses || [],
        resourceLocations: pendingQueryFilters.resourceLocations || [],
        resourceWorkLocationGroup:
          pendingQueryFilters.resourceWorkLocationGroup || [],
        projectStatuses: pendingQueryFilters.projectStatuses || [],
        userStatuses: pendingQueryFilters.userStatuses || [],
        userRoles: pendingQueryFilters.userRoles || [],
        show_actuals: pendingQueryFilters.show_actuals || false,
      };

      setCustomFilters(customFiltersFromQuery);

      // Set custom report type from query params
      const reportTypeFromQuery = pendingQueryFilters.reportType;
      if (reportTypeFromQuery === 'allocationCapacity' || reportTypeFromQuery === 'percentageAllocation') {
        setCustomReportType(reportTypeFromQuery);
      }

      // Prepare API filters for custom report
      const apiFilters: any = {
        Projects: customFiltersFromQuery.project,
        ProjectTypeGroups: customFiltersFromQuery.projectTypeGroup,
        ProjectTypes: customFiltersFromQuery.projectType,
        Teams: customFiltersFromQuery.team,
        Organizations: customFiltersFromQuery.organization,
        ProjectStatuses: ['Active'],
        StartDate: start || undefined,
        EndDate: end || undefined,
      };

      setAPIFilters(apiFilters);

      // Auto-generate custom report based on reportType
      if (reportTypeFromQuery === 'allocationCapacity') {
        dispatch(fetchAllocationCapacityRequest(apiFilters));
      } else {
        dispatch(fetchCustomReportRequest(apiFilters));
      }
      setHasAppliedQueryParams(true);
      setFiltersExpanded(false);
      setIsInitializing(false);
      return;
    }

    // Handle Reports Tab (existing logic)
    // Data is loaded, now apply the query params
    const mergedFilters: ReportFilters = {
      reportType: pendingQueryFilters.reportType || 'resourceProjectPeriod',
      period: pendingQueryFilters.period || 'last_week',
      customDateRange:
        pendingQueryFilters.customStartDate && pendingQueryFilters.customEndDate
          ? [
              dayjs(pendingQueryFilters.customStartDate),
              dayjs(pendingQueryFilters.customEndDate),
            ]
          : undefined,
      team: pendingQueryFilters.team || [],
      organization: pendingQueryFilters.organization || [],
      resourceType: pendingQueryFilters.resourceType || [],
      resource: pendingQueryFilters.resource || [],
      projectType: pendingQueryFilters.projectType || [],
      projectTypeGroup: pendingQueryFilters.projectTypeGroup || [],
      project: pendingQueryFilters.project || [],
      portfolio: pendingQueryFilters.portfolio || [],
      projectManager: pendingQueryFilters.projectManager || [],
      allocationManager: pendingQueryFilters.allocationManager || [],
      resourceStatuses: pendingQueryFilters.resourceStatuses || [],
      resourceLocations: pendingQueryFilters.resourceLocations || [],
      resourceWorkLocationGroup:
        pendingQueryFilters.resourceWorkLocationGroup || [],
      projectStatuses: pendingQueryFilters.projectStatuses || [],
      userStatuses: pendingQueryFilters.userStatuses || [],
      userRoles: pendingQueryFilters.userRoles || [],
    };
    setFilters(mergedFilters);

    // Prepare API filters
    const [start, end] = mergedFilters.customDateRange || [];
    const uiFilters: ReportUIFilters = {
      reportType: mergedFilters.reportType as ReportType,
      period: mergedFilters.period as ReportUIFilters['period'],
      customStartDate: start ? start.format('YYYY-MM-DD') : '',
      customEndDate: end ? end.format('YYYY-MM-DD') : '',
      team: mergedFilters.team,
      organization: mergedFilters.organization,
      resourceType: mergedFilters.resourceType,
      resource: mergedFilters.resource,
      projectType: mergedFilters.projectType,
      projectTypeGroup: mergedFilters.projectTypeGroup,
      project: mergedFilters.project,
      portfolio: mergedFilters.portfolio,
      projectManager: mergedFilters.projectManager,
      allocationManager: mergedFilters.allocationManager,
      resourceStatuses: mergedFilters.resourceStatuses,
      resourceLocations: mergedFilters.resourceLocations,
      resourceWorkLocationGroup: mergedFilters.resourceWorkLocationGroup,
      projectStatuses: mergedFilters.projectStatuses,
      userStatuses: mergedFilters.userStatuses,
      userRoles: mergedFilters.userRoles,
    };

    const apiPayload = prepareApiPayload(uiFilters);

    // Fetch the report data
    dispatch(
      fetchReport({ reportType: uiFilters.reportType, uiFilters: apiPayload })
    );
    setShowData(true);
    setFiltersExpanded(false);
    setHasAppliedQueryParams(true);
    setPendingQueryFilters(null);
    // Keep isInitializing true until report loads
  }, [
    pendingQueryFilters,
    hasAppliedQueryParams,
    isDataLoaded,
    dispatch,
    loadingPermissions,
    searchParams,
  ]);

  // Effect 3: Load from sessionStorage only on initial page load (not on tab switch)
  useEffect(() => {
    if (loadingPermissions) return;
    // Only load from sessionStorage if:
    // 1. This is the initial page load (not switching tabs)
    // 2. Active tab is 'reports'
    // 3. There are no query params and we haven't already applied them
    if (
      hasAttemptedInitialLoadRef.current ||
      activeTab !== 'reports' ||
      pendingQueryFilters ||
      hasAppliedQueryParams
    )
      return;

    // Mark that we've attempted the initial load
    hasAttemptedInitialLoadRef.current = true;

    const savedLastReport = sessionStorage.getItem('last_generated_report');

    if (savedLastReport) {
      try {
        const parsed = JSON.parse(savedLastReport);
        const f = parsed.uiFilters;

        // Restore filters
        setFilters({
          reportType: f.reportType,
          period: f.period || 'last_week',
          customDateRange:
            f.customStartDate && f.customEndDate
              ? [dayjs(f.customStartDate), dayjs(f.customEndDate)]
              : undefined,
          team: f.team || [],
          organization: f.organization || [],
          resourceType: f.resourceType || [],
          resource: f.resource || [],
          projectType: f.projectType || [],
          projectTypeGroup: f.projectTypeGroup || [],
          project: f.project || [],
          portfolio: f.portfolio || [],
          projectManager: f.projectManager || [],
          allocationManager: f.allocationManager || [],
          resourceStatuses: f.resourceStatuses || [],
          resourceLocations: f.resourceLocations || [],
          resourceWorkLocationGroup: f.resourceWorkLocationGroup || [],
          projectStatuses: f.projectStatuses || [],
          userStatuses: f.userStatuses || [],
          userRoles: f.userRoles || [],
        });

        // Fetch the report data
        dispatch(fetchReport({ reportType: f.reportType, uiFilters: f }));
        setShowData(true);
        setFiltersExpanded(false);
        setHasAppliedQueryParams(true);
      } catch (error) {
        console.error('Error loading last report:', error);
      }
    }
  }, [
    dispatch,
    pendingQueryFilters,
    hasAppliedQueryParams,
    loadingPermissions,
  ]);

  // Read report data and loading from Redux

  useEffect(() => {
    if (loadingPermissions) return;
    if (currentReport) {
      setIsLoading(currentReport.loading);
      if (!currentReport.loading) {
        if (currentReport.data.length > 0) {
          setReportGenerated(true);
        }
        setReportData(currentReport.data);
        // Report has finished loading, clear initializing flag
        if (isInitializing) {
          setIsInitializing(false);
        }
      }
    }
  }, [currentReport, isInitializing, loadingPermissions]);

  // Watch AI summary loading state
  useEffect(() => {
    if (loadingPermissions) return;
    if (activeTab === 'aisummary' && aiSummaryState) {
      setIsLoading(aiSummaryState.loading);
      if (!aiSummaryState.loading && aiSummaryState.currentSummary) {
        // Summary has finished loading
        setReportGenerated(true);
      }
    }
  }, [aiSummaryState, activeTab, loadingPermissions]);

  useEffect(() => {
    if (
      customReportType === 'allocationCapacity' &&
      !pendingQueryFilters &&
      !hasAppliedQueryParams &&
      !customFilters.customDateRange
    ) {
      // Calculate 13-week range: 4 weeks past + current week + 8 weeks future
      const currentMonday = dayjs().isoWeekday(1);
      const startDate = currentMonday.subtract(4, 'week');
      const endDate = currentMonday.add(8, 'week').isoWeekday(7);
      
      setCustomFilters(prev => ({
        ...prev,
        period: 'custom',
        customDateRange: [startDate, endDate],
      }));
    }
  }, [customReportType, pendingQueryFilters, hasAppliedQueryParams, customFilters.customDateRange]);

  // DataGrid columns based on reportType
  const columns = getReportColumns(filters.reportType as ReportType);
  const hiddenColumns = getHiddenColumns(filters.reportType as ReportType);
  
  // Fetch saved reports from API on component mount
  useEffect(() => {
    if (userData && 'id' in userData && userData.id) {
      dispatch({ type: FETCH_SAVED_REPORTS, payload: {userId : userData.id } });
    }
  }, [userData, dispatch]);

  const handleSaveReport = (name: string) => {
    const [start, end] = filters.customDateRange || [];
    const uiFilters: ReportUIFilters = {
      reportType: filters.reportType as ReportType,
      period: filters.period as ReportUIFilters['period'],
      customStartDate: start ? start.format('YYYY-MM-DD') : undefined,
      customEndDate: end ? end.format('YYYY-MM-DD') : undefined,
      team: filters.team,
      organization: filters.organization,
      resourceType: filters.resourceType,
      resource: filters.resource,
      projectType: filters.projectType,
      projectTypeGroup: filters.projectTypeGroup,
      project: filters.project,
      portfolio: filters.portfolio,
      projectManager: filters.projectManager,
      allocationManager: filters.allocationManager,
      resourceStatuses: filters.resourceStatuses,
      resourceLocations: filters.resourceLocations,
      resourceWorkLocationGroup: filters.resourceWorkLocationGroup,
      projectStatuses: filters.projectStatuses,
      userStatuses: filters.userStatuses,
      userRoles: filters.userRoles,
    };
    const entry = {
      name,
      reportType: uiFilters.reportType,
      uiFilters,
      createdAt: new Date().toISOString(),
    };
    const next = [...SavedReports.filter(r => r.name !== name), entry];
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedReports(next);
  };

  const handleLoadReport = (reportId: string) => {
    const report = savedReports.find(r => r.Id === reportId);
    if (!report) return;
    
    // Convert saved filters back to UI filters format
    const savedFilters = report.Filters as any;
    
    // Determine which tab this report belongs to
    const isAISummary = report.ReportType === 'aisummary';
    const isCustom = report.ReportType === 'percentageAllocation' || report.ReportType === 'allocationCapacity';
    
    if (isAISummary) {
      // Handle AI Summary report
      const summaryType = savedFilters.summaryType || 'project';
      
      setSummaryFilters({
        reportType: 'resourceProjectPeriod', // Dummy value
        summaryType: summaryType as SummaryType,
        period: savedFilters.period || 'last_week',
        customDateRange:
          savedFilters.customStartDate && savedFilters.customEndDate
            ? [dayjs(savedFilters.customStartDate), dayjs(savedFilters.customEndDate)]
            : undefined,
        team: savedFilters.team || [],
        organization: savedFilters.organization || [],
        resourceType: savedFilters.resourceType || [],
        resource: savedFilters.resource || [],
        projectType: savedFilters.projectType || [],
        projectTypeGroup: savedFilters.projectTypeGroup || [],
        project: savedFilters.project || [],
        portfolio: savedFilters.portfolio || [],
        projectManager: savedFilters.projectManager || [],
        allocationManager: savedFilters.allocationManager || [],
        resourceStatuses: savedFilters.resourceStatuses || [],
        resourceLocations: savedFilters.resourceLocations || [],
        resourceWorkLocationGroup: savedFilters.resourceWorkLocationGroup || [],
        projectStatuses: savedFilters.projectStatuses || [],
        userStatuses: savedFilters.userStatuses || [],
        userRoles: savedFilters.userRoles || [],
      });
      
      // Prepare and dispatch AI Summary request
      const [start, end] = savedFilters.customStartDate && savedFilters.customEndDate
        ? [dayjs(savedFilters.customStartDate), dayjs(savedFilters.customEndDate)]
        : [];
      
      const summaryUiFilters = {
        summaryType,
        period: savedFilters.period || 'last_week',
        customStartDate: start ? start.format('YYYY-MM-DD') : undefined,
        customEndDate: end ? end.format('YYYY-MM-DD') : undefined,
        ...savedFilters,
      };
      
      dispatch(fetchProjectSummary(summaryUiFilters));
      
    } else if (isCustom) {
      // Handle Custom report
      const customStart = savedFilters.customStartDate
        ? dayjs(savedFilters.customStartDate).format('MMM DD, YYYY')
        : undefined;
      const customEnd = savedFilters.customEndDate
        ? dayjs(savedFilters.customEndDate).format('MMM DD, YYYY')
        : undefined;
      
      const { start, end } = calculateDateRange(
        savedFilters.period || 'last_week',
        customStart,
        customEnd
      );
      
      setCustomFilters({
        reportType: report.ReportType as ReportType,
        period: savedFilters.period || 'last_week',
        customDateRange:
          savedFilters.customStartDate && savedFilters.customEndDate
            ? [dayjs(savedFilters.customStartDate), dayjs(savedFilters.customEndDate)]
            : undefined,
        team: savedFilters.team || [],
        organization: savedFilters.organization || [],
        resourceType: savedFilters.resourceType || [],
        resource: savedFilters.resource || [],
        projectType: savedFilters.projectType || [],
        projectTypeGroup: savedFilters.projectTypeGroup || [],
        project: savedFilters.project || [],
        portfolio: savedFilters.portfolio || [],
        projectManager: savedFilters.projectManager || [],
        allocationManager: savedFilters.allocationManager || [],
        resourceStatuses: savedFilters.resourceStatuses || [],
        resourceLocations: savedFilters.resourceLocations || [],
        resourceWorkLocationGroup: savedFilters.resourceWorkLocationGroup || [],
        projectStatuses: savedFilters.projectStatuses || [],
        userStatuses: savedFilters.userStatuses || [],
        userRoles: savedFilters.userRoles || [],
        show_actuals: savedFilters.show_actuals || false,
      });
      
      const apiFilters: any = {
        Projects: savedFilters.project || [],
        ProjectTypeGroups: savedFilters.projectTypeGroup || [],
        ProjectTypes: savedFilters.projectType || [],
        Teams: savedFilters.team || [],
        Organizations: savedFilters.organization || [],
        ProjectStatuses: ['Active'],
        StartDate: start || undefined,
        EndDate: end || undefined,
      };
      
      const uiFilters = {
        reportType: report.ReportType,
        period: savedFilters.period || 'last_week',
        customStartDate: start,
        customEndDate: end,
        project: savedFilters.project || [],
        projectTypeGroup: savedFilters.projectTypeGroup || [],
        projectType: savedFilters.projectType || [],
        team: savedFilters.team || [],
        organization: savedFilters.organization || [],
        show_actuals: savedFilters.show_actuals || false,
      };
      
      if (report.ReportType === 'allocationCapacity') {
        dispatch(fetchAllocationCapacityRequest(apiFilters, uiFilters));
      } else {
        dispatch(fetchCustomReportRequest(apiFilters, uiFilters));
      }
      
    } else {
      // Handle regular Reports tab
      setFilters({
        reportType: report.ReportType as ReportType,
        period: savedFilters.period || 'last_week',
        customDateRange:
          savedFilters.customStartDate && savedFilters.customEndDate
            ? [dayjs(savedFilters.customStartDate), dayjs(savedFilters.customEndDate)]
            : undefined,
        team: savedFilters.Teams || savedFilters.team || [],
        organization: savedFilters.Organizations || savedFilters.organization || [],
        resourceType: savedFilters.ResourceTypes || savedFilters.resourceType || [],
        resource: savedFilters.Resources || savedFilters.resource || [],
        projectType: savedFilters.ProjectTypes || savedFilters.projectType || [],
        projectTypeGroup: savedFilters.ProjectTypeGroups || savedFilters.projectTypeGroup || [],
        project: savedFilters.Projects || savedFilters.project || [],
        portfolio: savedFilters.Portfolios || savedFilters.portfolio || [],
        projectManager: savedFilters.ProjectManagers || savedFilters.projectManager || [],
        allocationManager: savedFilters.AllocationManagers || savedFilters.allocationManager || [],
        resourceStatuses: savedFilters.ResourceStatuses || savedFilters.resourceStatuses || [],
        resourceLocations: savedFilters.ResourceLocations || savedFilters.resourceLocations || [],
        resourceWorkLocationGroup: savedFilters.ResourceWorkLocationGroup || savedFilters.resourceWorkLocationGroup || [],
        projectStatuses: savedFilters.ProjectStatuses || savedFilters.projectStatuses || [],
        userStatuses: savedFilters.UserStatuses || savedFilters.userStatuses || [],
        userRoles: savedFilters.UserRoles || savedFilters.userRoles || [],
      });
      
      // Prepare API filters from saved report
      const [start, end] = 
        savedFilters.customStartDate && savedFilters.customEndDate
          ? [dayjs(savedFilters.customStartDate), dayjs(savedFilters.customEndDate)]
          : [];
      
      const uiFilters: ReportUIFilters = {
        reportType: report.ReportType as ReportType,
        period: savedFilters.period || 'last_week',
        customStartDate: start ? start.format('YYYY-MM-DD') : undefined,
        customEndDate: end ? end.format('YYYY-MM-DD') : undefined,
        team: savedFilters.Teams || savedFilters.team || [],
        organization: savedFilters.Organizations || savedFilters.organization || [],
        resourceType: savedFilters.ResourceTypes || savedFilters.resourceType || [],
        resource: savedFilters.Resources || savedFilters.resource || [],
        projectType: savedFilters.ProjectTypes || savedFilters.projectType || [],
        projectTypeGroup: savedFilters.ProjectTypeGroups || savedFilters.projectTypeGroup || [],
        project: savedFilters.Projects || savedFilters.project || [],
        portfolio: savedFilters.Portfolios || savedFilters.portfolio || [],
        projectManager: savedFilters.ProjectManagers || savedFilters.projectManager || [],
        allocationManager: savedFilters.AllocationManagers || savedFilters.allocationManager || [],
        resourceStatuses: savedFilters.ResourceStatuses || savedFilters.resourceStatuses || [],
        resourceLocations: savedFilters.ResourceLocations || savedFilters.resourceLocations || [],
        resourceWorkLocationGroup: savedFilters.ResourceWorkLocationGroup || savedFilters.resourceWorkLocationGroup || [],
        projectStatuses: savedFilters.ProjectStatuses || savedFilters.projectStatuses || [],
        userStatuses: savedFilters.UserStatuses || savedFilters.userStatuses || [],
        userRoles: savedFilters.UserRoles || savedFilters.userRoles || [],
      };
      
      const apiPayload = prepareApiPayload(uiFilters);
      
      // Dispatch fetch with restored filters
      dispatch(fetchReport({ reportType: report.ReportType as ReportType, uiFilters: apiPayload }));
    }
    
    setShowData(true);
    setReportGenerated(true);
    setFiltersExpanded(false);
    
    // Set the current loaded report in Redux
    dispatch(setCurrentLoadedReport(report));
    
    dispatch(
      showToast({
        open: true,
        message: `Loaded report: ${report.Name}`,
        type: 'success',
        position: 'bottom-left',
        autoHideTimer: 3000,
      })
    );
  };

  const getSelectedFiltersCount = () => {
    let count = 0;

    // Check period as string
    if (filters.period) count++;

    // Check arrays - count as active if not empty
    if (Array.isArray(filters.project) && filters.project.length > 0) count++;
    if (Array.isArray(filters.team) && filters.team.length > 0) count++;
    if (Array.isArray(filters.organization) && filters.organization.length > 0)
      count++;
    if (Array.isArray(filters.resourceType) && filters.resourceType.length > 0)
      count++;
    if (Array.isArray(filters.resource) && filters.resource.length > 0) count++;
    if (Array.isArray(filters.projectType) && filters.projectType.length > 0)
      count++;
    if (
      Array.isArray(filters.projectTypeGroup) &&
      filters.projectTypeGroup.length > 0
    )
      count++;
    if (Array.isArray(filters.portfolio) && filters.portfolio.length > 0)
      count++;
    if (
      Array.isArray(filters.projectManager) &&
      filters.projectManager.length > 0
    )
      count++;
    if (
      Array.isArray(filters.allocationManager) &&
      filters.allocationManager.length > 0
    )
      count++;
    if (
      Array.isArray(filters.resourceStatuses) &&
      filters.resourceStatuses.length > 0
    )
      count++;
    if (
      Array.isArray(filters.resourceLocations) &&
      filters.resourceLocations.length > 0
    )
      count++;
    if (
      Array.isArray(filters.resourceWorkLocationGroup) &&
      filters.resourceWorkLocationGroup.length > 0
    )
      count++;
    if (
      Array.isArray(filters.projectStatuses) &&
      filters.projectStatuses.length > 0
    )
      count++;

    return count;
  };

  // Handle tab change and update URL
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);

    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', newValue);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Sync active tab with URL and set default tab parameter if missing
  useEffect(() => {
    const tabFromUrl = searchParams?.get('tab');

    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }

    if (!tabFromUrl) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('tab', 'reports');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams]);

  // Track if we're in a drill-down scenario (have pending or applied query filters)
  const isDrillingDown = pendingQueryFilters !== null || hasAppliedQueryParams;

  // loading permissions
  if (loadingPermissions) {
    return <LoadingScreen />;
  }

  // no access
  if (noAccess) {
    return <ErrorPage type="accessDenied" redirectPath="/dashboard" />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Show loading overlay when initializing from query params (only for reports tab) */}
      {isInitializing && activeTab === 'reports' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#F9FAFB',
            zIndex: 1000,
          }}
        >
          <LoadingScreen />
        </Box>
      )}

      {/* Reports Tab */}
      {(permissions?.['Reports']?.r ||
        permissions?.['AISummary']?.r ||
        permissions?.['CustomReports']?.r ||
        isDrillingDown) && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: '#fff',
            px: 3,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                minHeight: 48,
                color: '#6B7280',
                '&.Mui-selected': {
                  color: '#152E75',
                  fontWeight: 600,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#152E75',
                height: 3,
              },
            }}
          >
            {(permissions?.['Reports']?.r || isDrillingDown) && (
              <Tab label="Reports" value="reports" />
            )}
            {permissions?.['AISummary']?.r && (
              <Tab label="AI Summary" value="aisummary" />
            )}
            {permissions?.['CustomReports']?.r && (
              <Tab label="Custom" value="custom" />
            )}
          </Tabs>
        </Box>
      )}

      {/* Conditional rendering based on active tab */}
      {activeTab === 'reports' && (
        <>
          {/* Toolbar */}
          <ReportBuilderToolbar
            reportType={filters.reportType as ReportType}
            tab="reports"
            onGenerateReport={handleGenerateReport}
            onLoadReport={handleLoadReport}
            onExport={handleExport}
            onShare={handleShare}
            isLoading={isLoading}
            onReportTypeChange={(reportType: ReportType) => {
              setReportGenerated(false);
              setShowData(false);
              setReportData([]);
              setFilters({
                reportType: reportType,
                period: 'last_week',
                customDateRange: undefined,
                team: [],
                organization: [],
                resourceType: [],
                resource: [],
                projectType: [],
                projectTypeGroup: [],
                project: [],
                portfolio: [],
                projectManager: [],
                allocationManager: [],
                resourceStatuses: [],
                resourceLocations: [],
                resourceWorkLocationGroup: [],
                projectStatuses: [],
                userStatuses: [],
                userRoles: [],
              });
              setFiltersExpanded(true);
            }}
            selectedFiltersCount={getSelectedFiltersCount()}
          />

          {/* Filters */}
          <ReportBuilderFilters
            expanded={filtersExpanded}
            onToggle={() => setFiltersExpanded(!filtersExpanded)}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onResetFilters={handleResetFilters}
          />

          {/* Content Area */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: '#F9FAFB',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!reportGenerated && !showData ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#6B7280',
                    mb: 3,
                  }}
                >
                  Configure your filters and generate a report to see data here
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={
                    !(permissions && permissions['Reports'].r) || isLoading
                  }
                  sx={{
                    height: 40,
                    backgroundColor: '#152E75',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    px: 4,
                    borderRadius: '6px',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#1C3A8C',
                      boxShadow: 'none',
                    },
                    '&:disabled': {
                      backgroundColor: '#D1D5DB',
                    },
                  }}
                >
                  {isLoading ? 'Generating...' : 'Generate Report'}
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  p: isFullscreenGrid ? 0 : 0,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    height: isFullscreenGrid ? '100vh' : '100%',
                    minHeight: 400,
                    backgroundColor: '#ffffff',
                    borderRadius: isFullscreenGrid ? 0 : '0px',
                    overflow: 'hidden',
                    position: isFullscreenGrid ? 'fixed' : 'relative',
                    top: isFullscreenGrid ? 0 : 'auto',
                    left: isFullscreenGrid ? 0 : 'auto',
                    right: isFullscreenGrid ? 0 : 'auto',
                    bottom: isFullscreenGrid ? 0 : 'auto',
                    zIndex: isFullscreenGrid ? 1300 : 'auto',
                  }}
                >
                  <StyledDataGrid
                    key={filters.reportType}
                    rows={reportData}
                    columns={columns}
                    hideFooter
                    loading={isLoading}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 25, page: 0 },
                      },
                      sorting: {
                        sortModel: [
                          {
                            field:
                              columns.find(
                                col =>
                                  col.field === 'resource_name' ||
                                  col.field === 'project_name'
                              )?.field ||
                              columns[0]?.field ||
                              'id',
                            sort: 'asc',
                          },
                        ],
                      },
                      columns: {
                        columnVisibilityModel: hiddenColumns,
                      },
                    }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    disableRowSelectionOnClick
                    localeText={{
                      noRowsLabel: 'No data found',
                    }}
                    slots={{
                      toolbar: ReportBuilderDataGridToolbar,
                    }}
                    slotProps={{
                      toolbar: {
                        isFullscreen: isFullscreenGrid,
                        onToggleFullscreen: () =>
                          setIsFullscreenGrid(prev => !prev),
                        GridRowCount: reportData.length,
                        reportType: filters.reportType,
                        tab: 'reports',
                      } as any,
                      columnsPanel: {
                        className: 'styleColumnMenu',
                        sx: ColumnManagementStyles,
                      },
                      loadingOverlay: {
                        variant: 'skeleton',
                        noRowsVariant: 'skeleton',
                      },
                    }}
                    sx={{
                      height: '100%',
                      '& .MuiDataGrid-virtualScrollerContent': {
                        backgroundColor: '#F7FBFF',
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: '#F7FBFF',
                      },
                      '& .MuiDataGrid-cell': {
                        border: '0.5px solid #E5E7EB !important',
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        position: 'sticky',
                        top: 0,
                        zIndex: 3,
                        backgroundColor: '#F1F6FF',
                      },
                      '& .MuiDataGrid-cell--textRight': {
                        textAlign: 'right !important',
                      },
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* AI Summary Tab */}
      {activeTab === 'aisummary' && (
        <>
          <ReportBuilderToolbar
            reportType={summaryFilters.reportType as ReportType}
            tab="aisummary"
            onGenerateReport={handleGenerateSummary}
            onLoadReport={handleLoadReport}
            onExport={handleExport}
            onShare={handleShare}
            isLoading={isLoading}
            onSummaryTypeChange={(summaryType: SummaryType) => {
              setReportGenerated(false);
              setShowData(false);
              setReportData([]);
              setSummaryFilters({
                reportType: 'resourceProjectPeriod',
                summaryType: summaryType,
                period: 'last_week',
                customDateRange: undefined,
                team: [],
                organization: [],
                resourceType: [],
                resource: [],
                projectType: [],
                projectTypeGroup: [],
                project: [],
                portfolio: [],
                projectManager: [],
                allocationManager: [],
                resourceStatuses: [],
                resourceLocations: [],
                resourceWorkLocationGroup: [],
                projectStatuses: [],
                userStatuses: [],
                userRoles: [],
              });
              setFiltersExpanded(true);
            }}
            selectedFiltersCount={getSummarySelectedFiltersCount()}
          />

          <ReportBuilderFilters
            expanded={filtersExpanded}
            onToggle={() => setFiltersExpanded(!filtersExpanded)}
            filters={summaryFilters}
            onFiltersChange={handleSummaryFiltersChange}
            onResetFilters={handleResetSummaryFilters}
            mode="aisummary"
          />

          <Box
            sx={{
              flex: 1,
              backgroundColor: '#F9FAFB',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <AISummaryTab />
          </Box>
        </>
      )}

      {/* Custom Tab*/}
      {activeTab === 'custom' && (
        <>
          <ReportBuilderToolbar
            reportType={customFilters.reportType as ReportType}
            tab="custom"
            onGenerateReport={handleGenerateCustomReport}
            onLoadReport={handleLoadReport}
            onCustomReportTypeChange={setCustomReportType}
            customReportType={customReportType}
            onExport={handleExport}
            onShare={handleShare}
            isLoading={customReportState.loading}
            selectedFiltersCount={getCustomSelectedFiltersCount()}
          />

          {/* Filters for Custom tab */}
          <ReportBuilderFilters
            expanded={filtersExpanded}
            onToggle={() => setFiltersExpanded(!filtersExpanded)}
            filters={customFilters}
            onFiltersChange={handleCustomFiltersChange}
            onResetFilters={handleResetCustomFilters}
            mode="custom"
          />

          <Box
            sx={{
              flex: 1,
              backgroundColor: '#F9FAFB',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              p: 0,
            }}
          >
            <CustomTab
              showActuals={customFilters.show_actuals || false}
              APIFilters={APIFilters}
              customReportType={customReportType}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default withRBAC(ReportBuilderPage, [
  'Reports',
  'AISummary',
  'CustomReports',
]);
