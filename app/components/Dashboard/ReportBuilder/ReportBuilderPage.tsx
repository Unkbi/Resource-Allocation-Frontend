'use client';

import { Box, Typography, Button } from '@mui/material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import { useState, useEffect } from 'react';
import ReportBuilderToolbar from './ReportBuilderToolbar';
import ReportBuilderFilters, { ReportFilters } from './ReportBuilderFilters';
import ReportBuilderDataGridToolbar from './ReportBuilderDataGridToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReport } from '@/app/redux/actions/dashboardAction';
import { RootState } from '@/app/redux/store';
import { ReportType, ReportUIFilters } from '@/app/types/dashboardTypes';
import { getReportColumns } from './reportColumns';
import dayjs from 'dayjs';

interface ReportBuilderProps {
  onReportGenerate?: (filters: ReportFilters) => void;
}

// Mock data for the DataGrid
const mockReportData = [
  {
    id: 1,
    resources: 'John Doe',
    resourceType: 'FTE',
    team: 'Engineering',
    organization: 'Tech Division',
    allocationManager: 'Manager A',
    project: 'Sales Technology',
    projectManager: 'Manager X',
    projectType: 'Internal',
    projectPortfolio: 'Portfolio A',
    weekPeriod: 'Week 1',
    planned: 40,
    actual: 38,
    hourlyCost: 75,
    allocationCost: 3000,
    actualCost: 2850,
    plannedRevenue: 3500,
    projectAllocation: '95%',
  },
  {
    id: 2,
    resources: 'Jane Smith',
    resourceType: 'Contractor',
    team: 'Product',
    organization: 'Product Division',
    allocationManager: 'Manager B',
    project: 'QA Network',
    projectManager: 'Manager Y',
    projectType: 'External',
    projectPortfolio: 'Portfolio B',
    weekPeriod: 'Week 1',
    planned: 35,
    actual: 35,
    hourlyCost: 85,
    allocationCost: 2975,
    actualCost: 2975,
    plannedRevenue: 3200,
    projectAllocation: '100%',
  },
  {
    id: 3,
    resources: 'Mike Johnson',
    resourceType: 'FTE',
    team: 'Design',
    organization: 'Tech Division',
    allocationManager: 'Manager A',
    project: 'Sales Technology',
    projectManager: 'Manager X',
    projectType: 'Internal',
    projectPortfolio: 'Portfolio A',
    weekPeriod: 'Week 2',
    planned: 40,
    actual: 40,
    hourlyCost: 70,
    allocationCost: 2800,
    actualCost: 2800,
    plannedRevenue: 3100,
    projectAllocation: '100%',
  },
];

export default function ReportBuilderPage({
  onReportGenerate,
}: ReportBuilderProps) {
  const dispatch = useDispatch();
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'resourceProjectPeriodCost',
    period: 'this_week',
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<{ name: string; reportType: ReportType; uiFilters: ReportUIFilters; createdAt: string }[]>([]);

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
    setFiltersExpanded(false);

    // Serialize custom date range for UI filters stored in redux
    const [start, end] = filters.customDateRange || [];
    const uiFilters: ReportUIFilters = {
      reportType: filters.reportType as ReportType,
      period: filters.period as ReportUIFilters['period'],
      customStartDate: start ? start.toISOString() : '',
      customEndDate: end ? end.toISOString() : '',
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
    };
    const apiPayload = prepareApiPayload(uiFilters);
    dispatch(fetchReport({ reportType: uiFilters.reportType, uiFilters:apiPayload }));
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
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      reportType: 'resourceProjectPeriodCost',
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
    });
  };

  // Read report data and loading from Redux
  const reportSlice = useSelector((state: RootState) => state.dashboard.report);
  const currentReport = reportSlice?.[filters.reportType as ReportType];
  useEffect(() => {
    if (currentReport) {
      setIsLoading(currentReport.loading);
      if (!currentReport.loading && currentReport.data) {
        setReportGenerated(true);
        // setReportData(currentReport.data); //data is not structured as per the columns yet
        setReportData(mockReportData); // Using mock data for now
      }
    }
  }, [currentReport]);

  // DataGrid columns based on reportType
  const columns = getReportColumns(filters.reportType as ReportType);

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
      customStartDate: start ? start.toISOString() : undefined,
      customEndDate: end ? end.toISOString() : undefined,
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
    });
    // Dispatch fetch with restored filters
    dispatch(fetchReport({ reportType: f.reportType, uiFilters: f }));
  };

  const getSelectedFiltersCount = () => {
    let count = 0;
    if (filters.reportType !== 'resourceProjectPeriodCost') count++;
    
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
    
    return count;
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <ReportBuilderToolbar
        onGenerateReport={handleGenerateReport}
        onExport={handleExport}
        onShare={handleShare}
        isLoading={isLoading}
        onReportTypeChange={(reportType: ReportType) =>
          setFilters((prev) => ({ ...prev, 'reportType':reportType }))
        }
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
          overflowY: 'auto',
        }}
      >
        {!reportGenerated ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 3,
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
              disabled={isLoading}
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
          <Box sx={{ height: '100%', p: 3 }}>
            <Box
              sx={{
                height: '100%',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
              }}
            >
              <DataGridPremium
                rows={reportData}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25, page: 0 },
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                slots={{
                  toolbar: ReportBuilderDataGridToolbar,
                }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#cae4feff',
                    borderBottom: '2px solid #E5E7EB',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: '13px',
                    color: '#1F2937',
                    borderBottom: '1px solid #F3F4F6',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#F9FAFB',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '2px solid #E5E7EB',
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
