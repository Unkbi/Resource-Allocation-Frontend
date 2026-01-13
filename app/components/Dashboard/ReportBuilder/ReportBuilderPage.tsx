'use client';

import { Box, Typography, Button } from '@mui/material';
import { DataGridPremium, GridColDef, GridRowCount } from '@mui/x-data-grid-premium';
import { useState, useEffect } from 'react';
import ReportBuilderToolbar from './ReportBuilderToolbar';
import ReportBuilderFilters, { ReportFilters } from './ReportBuilderFilters';
import ReportBuilderDataGridToolbar from './ReportBuilderDataGridToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReport } from '@/app/redux/actions/dashboardAction';
import { RootState } from '@/app/redux/store';
import { ReportType, ReportUIFilters } from '@/app/types/dashboardTypes';
import { getReportColumns, getHiddenColumns } from './reportColumns';
import dayjs from 'dayjs';
import { ColumnManagementStyles, StyledDataGrid } from '../../AllocationTable/styles/StyledDataGrid';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { useSearchParams } from 'next/navigation';
import LoadingScreen from '@/app/components/Loading/loadingScreen';

interface ReportBuilderProps {
  onReportGenerate?: (filters: ReportFilters) => void;
}

/**
 * Parse query params and convert them to filter values
 */
const parseQueryParams = (searchParams: URLSearchParams): Partial<ReportFilters> & { customStartDate?: string; customEndDate?: string } => {
  const filters: Partial<ReportFilters> & { customStartDate?: string; customEndDate?: string } = {};
  
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
  const projectTypeGroup = searchParams.get('projectTypeGroup') || searchParams.get('ProjectTypeGroup');
  if (projectTypeGroup) {
    filters.projectTypeGroup = parseArrayParam(projectTypeGroup);
  }

  const projectType = searchParams.get('projectType') || searchParams.get('ProjectType');
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

  const organization = searchParams.get('organization') || searchParams.get('Organization');
  if (organization) {
    filters.organization = parseArrayParam(organization);
  }

  const portfolio = searchParams.get('portfolio') || searchParams.get('Portfolio');
  if (portfolio) {
    filters.portfolio = parseArrayParam(portfolio);
  }

  const project = searchParams.get('project') || searchParams.get('Project');
  if (project) {
    filters.project = parseArrayParam(project);
  }

  const projectManager = searchParams.get('projectManager') || searchParams.get('ProjectManager');
  if (projectManager) {
    filters.projectManager = parseArrayParam(projectManager);
  }

  const allocationManager = searchParams.get('allocationManager') || searchParams.get('AllocationManager');
  if (allocationManager) {
    filters.allocationManager = parseArrayParam(allocationManager);
  }

  const resourceType = searchParams.get('resourceType') || searchParams.get('ResourceType');
  if (resourceType) {
    filters.resourceType = parseArrayParam(resourceType);
  }

 const resourceStatuses = searchParams.get('resourceStatuses') || searchParams.get('ResourceStatuses');
  if (resourceStatuses) {
    filters.resourceStatuses = parseArrayParam(resourceStatuses);
  }

  const resourceLocations = searchParams.get('resourceLocations') || searchParams.get('ResourceLocations');
  if (resourceLocations) {
    filters.resourceLocations = parseArrayParam(resourceLocations);
  }
  const resourceWorkLocationGroup = searchParams.get('resourceWorkLocationGroup') || searchParams.get('ResourceWorkLocationGroup');
  if (resourceWorkLocationGroup) {
    filters.resourceWorkLocationGroup = parseArrayParam(resourceWorkLocationGroup);
  }

  const projectStatuses = searchParams.get('projectStatuses') || searchParams.get('ProjectStatuses');
  if (projectStatuses) {
    filters.projectStatuses = parseArrayParam(projectStatuses);
  }

  // Parse custom date range
  const customStartDate = searchParams.get('customStartDate');
  const customEndDate = searchParams.get('customEndDate');
  if (customStartDate && customEndDate) {
    filters.customStartDate = customStartDate;
    filters.customEndDate = customEndDate;
  }

  return filters;
};

export default function ReportBuilderPage({
  onReportGenerate,
}: ReportBuilderProps) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const hasQueryParams = Boolean(searchParams && searchParams.toString());
  const [filtersExpanded, setFiltersExpanded] = useState(true);
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showData, setShowData] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<{ name: string; reportType: ReportType; uiFilters: ReportUIFilters; createdAt: string }[]>([]);
  const [isFullscreenGrid, setIsFullscreenGrid] = useState(false);
  const [pendingQueryFilters, setPendingQueryFilters] = useState<(Partial<ReportFilters> & { customStartDate?: string; customEndDate?: string }) | null>(null);
  const [hasAppliedQueryParams, setHasAppliedQueryParams] = useState(false);
  const [isInitializing, setIsInitializing] = useState(hasQueryParams);

  const reportSlice = useSelector((state: RootState) => state.dashboard.report);
  const currentReport = reportSlice?.[filters.reportType as ReportType];
  
  // Get Redux data to check if it's loaded
  const { projectTypeGroups, projectTypes } = useSelector((state: RootState) => state.allSettings);
  const { portfolios } = useSelector((state: RootState) => state.portfolios);
  const { teams } = useSelector((state: RootState) => state.teams);
  const { resources } = useSelector((state: RootState) => state.resources);
  const { organisations } = useSelector((state: RootState) => state.organisations);
  const { projects } = useSelector((state: RootState) => state.projects);
  
  // Check if all necessary data is loaded
  const isDataLoaded = (teams?.length ?? 0) > 0 && (resources?.length ?? 0) > 0 && (projects?.length ?? 0) > 0 && (projectTypes?.length ?? 0) > 0 && (projectTypeGroups?.length ?? 0) > 0 && (organisations?.length ?? 0) > 0 && (portfolios?.length ?? 0) > 0;

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
    };
    const apiPayload = prepareApiPayload(uiFilters);
    try {
      dispatch(fetchReport({ reportType: uiFilters.reportType, uiFilters: apiPayload }));
      setShowData(true);
      // Save the last generated report to sessionStorage
      sessionStorage.setItem('last_generated_report', JSON.stringify({ uiFilters }));
    } catch (error) {
      console.error('Error generating report:', error);
      dispatch(showToast({ message: 'Failed to generate report. Please try again.', severity: 'error' }));
      setIsLoading(false);
      setShowData(false);
    }
    onReportGenerate?.(filters);
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
    });
  };

  // Effect 1: Parse and store query params on mount
  useEffect(() => {
    // Only run once on mount
    if (hasAppliedQueryParams) return;
    
    // Priority 1: Check for query params from dashboard navigation
    if (searchParams && searchParams.toString()) {
      const queryFilters = parseQueryParams(searchParams);
      if (Object.keys(queryFilters).length > 0) {
        setIsInitializing(true);
        // Store query params to apply later when data is loaded
        setPendingQueryFilters(queryFilters);
         // Mark that we're initializing with query params
        return; // Skip loading from sessionStorage
      }
      // Query params exist but nothing to apply
      setIsInitializing(false);
      return;
    }

    // No query params present
    setIsInitializing(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only run when searchParams change
  
  // Effect 2: Apply pending query params once data is loaded
  useEffect(() => {
    if (!pendingQueryFilters || hasAppliedQueryParams || !isDataLoaded) return;
    
    // Data is loaded, now apply the query params
    const mergedFilters: ReportFilters = {
      reportType: pendingQueryFilters.reportType || 'resourceProjectPeriod',
      period: pendingQueryFilters.period || 'last_week',
      customDateRange: pendingQueryFilters.customStartDate && pendingQueryFilters.customEndDate
        ? [dayjs(pendingQueryFilters.customStartDate), dayjs(pendingQueryFilters.customEndDate)]
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
      resourceWorkLocationGroup: pendingQueryFilters.resourceWorkLocationGroup || [],
      projectStatuses: pendingQueryFilters.projectStatuses || [],
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
    };
    
    const apiPayload = prepareApiPayload(uiFilters);
    
    // Fetch the report data
    dispatch(fetchReport({ reportType: uiFilters.reportType, uiFilters: apiPayload }));
    setShowData(true);
    setFiltersExpanded(false);
    setHasAppliedQueryParams(true);
    setPendingQueryFilters(null);
    // Keep isInitializing true until report loads
  }, [pendingQueryFilters, hasAppliedQueryParams, isDataLoaded, dispatch]);
  
  // Effect 3: Load from sessionStorage if no query params
  useEffect(() => {
    // Only load from sessionStorage if there are no query params and we haven't already applied them
    if (pendingQueryFilters || hasAppliedQueryParams) return;
    
    const savedLastReport = sessionStorage.getItem('last_generated_report');
    
    if (savedLastReport) {
      try {
      const parsed = JSON.parse(savedLastReport);
      const f = parsed.uiFilters;
      
      // Restore filters
      setFilters({
        reportType: f.reportType,
        period: f.period || 'last_week',
        customDateRange: f.customStartDate && f.customEndDate 
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
  }, [dispatch, pendingQueryFilters, hasAppliedQueryParams]);

  // Read report data and loading from Redux
  
  useEffect(() => {
    if (currentReport) {
      setIsLoading(currentReport.loading);
      if (!currentReport.loading) {
        if(currentReport.data.length > 0) {
        setReportGenerated(true);
        }
        setReportData(currentReport.data);
        // Report has finished loading, clear initializing flag
        if (isInitializing) {
          setIsInitializing(false);
        }
      }
    }
  }, [currentReport, isInitializing]);

  // DataGrid columns based on reportType
  const columns = getReportColumns(filters.reportType as ReportType);
  const hiddenColumns = getHiddenColumns(filters.reportType as ReportType);
  // Save/Load reports via localStorage
  const STORAGE_KEY = 'saved_reports';
  const loadSavedReports = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedReports(Array.isArray(parsed) ? parsed : []);
      if (searchParams && searchParams.toString()) {
        setIsInitializing(true); // Mark that we're initializing with query params
      }
    } catch {
      setSavedReports([]);
    }
  };
  useEffect(() => {
    loadSavedReports();
  }, []);

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
    };
    const entry = { name, reportType: uiFilters.reportType, uiFilters, createdAt: new Date().toISOString() };
    const next = [...savedReports.filter(r => r.name !== name), entry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedReports(next);
  };

  const handleLoadReport = (name: string) => {
    const entry = savedReports.find(r => r.name === name);
    if (!entry) return;
    const f = entry.uiFilters;
    // Restore UI filters in component state
    setFilters({
      reportType: f.reportType,
      period: f.period,
      customDateRange: f.customStartDate && f.customEndDate ? [dayjs(f.customStartDate), dayjs(f.customEndDate)] : undefined,
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
    });
    // Dispatch fetch with restored filters
    dispatch(fetchReport({ reportType: f.reportType, uiFilters: f }));
  };

  const getSelectedFiltersCount = () => {
    let count = 0;

    // Check period as string
    if (filters.period) count++;

    // Check arrays - count as active if not empty
    if (Array.isArray(filters.project) && filters.project.length > 0) count++;
    if (Array.isArray(filters.team) && filters.team.length > 0) count++;
    if (Array.isArray(filters.organization) && filters.organization.length > 0) count++;
    if (Array.isArray(filters.resourceType) && filters.resourceType.length > 0) count++;
    if (Array.isArray(filters.resource) && filters.resource.length > 0) count++;
    if (Array.isArray(filters.projectType) && filters.projectType.length > 0) count++;
    if (Array.isArray(filters.projectTypeGroup) && filters.projectTypeGroup.length > 0) count++;
    if (Array.isArray(filters.portfolio) && filters.portfolio.length > 0) count++;
    if (Array.isArray(filters.projectManager) && filters.projectManager.length > 0) count++;
    if (Array.isArray(filters.allocationManager) && filters.allocationManager.length > 0) count++;
    if (Array.isArray(filters.resourceStatuses) && filters.resourceStatuses.length > 0) count++;
    if (Array.isArray(filters.resourceLocations) && filters.resourceLocations.length > 0) count++;
    if (Array.isArray(filters.resourceWorkLocationGroup) && filters.resourceWorkLocationGroup.length > 0) count++;
    if (Array.isArray(filters.projectStatuses) && filters.projectStatuses.length > 0) count++;

    return count;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Show loading overlay when initializing from query params */}
      {isInitializing && (
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

      {/* Toolbar */}
      <ReportBuilderToolbar
        reportType={filters.reportType as ReportType}
        onGenerateReport={handleGenerateReport}
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
          backgroundColor: "#F9FAFB",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!reportGenerated && !showData ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              // p: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 500,
                color: "#6B7280",
                mb: 3,
              }}
            >
              Configure your filters and generate a report to see data here
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              disabled={isLoading}
              sx={{
                height: 40,
                backgroundColor: "#152E75",
                color: "#fff",
                textTransform: "none",
                fontSize: 14,
                fontWeight: 600,
                px: 4,
                borderRadius: "6px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#1C3A8C",
                  boxShadow: "none",
                },
                "&:disabled": {
                  backgroundColor: "#D1D5DB",
                },
              }}
            >
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: isFullscreenGrid ? 0 : 0,
            }}
          >
            <Box
              sx={{
                flex: 1,
                height: isFullscreenGrid ? "100vh" : "100%",
                minHeight: 400,
                backgroundColor: "#ffffff",
                borderRadius: isFullscreenGrid ? 0 : "0px",
                overflow: "hidden",
                position: isFullscreenGrid ? "fixed" : "relative",
                top: isFullscreenGrid ? 0 : "auto",
                left: isFullscreenGrid ? 0 : "auto",
                right: isFullscreenGrid ? 0 : "auto",
                bottom: isFullscreenGrid ? 0 : "auto",
                zIndex: isFullscreenGrid ? 1300 : "auto",
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
                          columns.find((col) => col.field === "resource_name" || col.field === "project_name")?.field ||
                          columns[0]?.field ||
                          "id",
                        sort: "asc",
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
                  noRowsLabel: "No data found",
                }}
                slots={{
                  toolbar: ReportBuilderDataGridToolbar,
                }}
                slotProps={{
                  toolbar: {
                    isFullscreen: isFullscreenGrid,
                    onToggleFullscreen: () => setIsFullscreenGrid((prev) => !prev),
                    GridRowCount: reportData.length,
                  } as any,
                  columnsPanel: {
                    className: "styleColumnMenu",
                    sx: ColumnManagementStyles,
                  },
                  loadingOverlay: {
                    variant: "skeleton",
                    noRowsVariant: "skeleton",
                  },
                }}
                sx={{
                  height: "100%",
                  "& .MuiDataGrid-virtualScrollerContent": {
                    backgroundColor: "#F7FBFF",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#F7FBFF",
                  },
                  "& .MuiDataGrid-cell": {
                    border: "0.5px solid #E5E7EB !important",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                      position: "sticky",
                      top: 0,
                      zIndex: 3,
                      backgroundColor: "#F1F6FF",
                    },
                  "& .MuiDataGrid-cell--textRight":{
                    textAlign: "right !important",
                  }
                }}
              />
          </Box>       
      </Box>
       )}
    </Box>
    </Box>
  );
}
