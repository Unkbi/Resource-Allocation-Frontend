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

interface ReportBuilderProps {
  onReportGenerate?: (filters: ReportFilters) => void;
}

export default function ReportBuilderPage({
  onReportGenerate,
}: ReportBuilderProps) {
  const dispatch = useDispatch();
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

  const reportSlice = useSelector((state: RootState) => state.dashboard.report);
  const currentReport = reportSlice?.[filters.reportType as ReportType];

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

  useEffect(() => {
    // Load last report type and filters from sessionStorage on mount
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
      } catch (error) {
      console.error('Error loading last report:', error);
      }
    }
  }, []);

  // Read report data and loading from Redux
  
  useEffect(() => {
    if (currentReport) {
      setIsLoading(currentReport.loading);
      if (!currentReport.loading) {
        if(currentReport.data.length > 0) {
        setReportGenerated(true);
        }
        setReportData(currentReport.data);
      }
    }
  }, [currentReport, ]);

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
    if (filters.period !== 'last_week') count++;

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
