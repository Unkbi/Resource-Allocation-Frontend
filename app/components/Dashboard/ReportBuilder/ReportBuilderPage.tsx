'use client';

import { Box, Typography, Button } from '@mui/material';
import { DataGridPremium, GridColDef } from '@mui/x-data-grid-premium';
import { useState } from 'react';
import ReportBuilderToolbar from './ReportBuilderToolbar';
import ReportBuilderFilters, { ReportFilters } from './ReportBuilderFilters';
import ReportBuilderDataGridToolbar from './ReportBuilderDataGridToolbar';

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
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    reportType: 'allocation_actuals',
    period: 'this_week',
    customDateRange: undefined,
    team: ['all'],
    organization: ['all'],
    resourceType: ['all'],
    resource: ['all'],
    projectType: ['all'],
    projectTypeGroup: ['all'],
    project: ['all'],
    portfolio: ['all'],
    projectManager: ['all'],
    allocationManager: ['all'],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  // Helper function to prepare API payload from filters
  const prepareApiPayload = (filters: ReportFilters) => {
    const payload: any = {
      reportType: filters.reportType,
    };

    // Handle custom date range
    if (filters.period === 'custom' && filters.customDateRange) {
      const [startDate, endDate] = filters.customDateRange;
      if (startDate && endDate) {
        // Convert Dayjs objects to ISO string for API
        payload.customStartDate = startDate.toISOString();
        payload.customEndDate = endDate.toISOString();
      }
    }

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
    setFiltersExpanded(false); // Collapse filters after generating report

    // Prepare API payload
    const apiPayload = prepareApiPayload(filters);
    console.log('API Payload:', apiPayload);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setReportGenerated(true);
      setReportData(mockReportData);
      onReportGenerate?.(filters);
    }, 1500);
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
      reportType: 'allocation_actuals',
      period: 'last_week',
      customDateRange: undefined,
      team: ['all'],
      organization: ['all'],
      resourceType: ['all'],
      resource: ['all'],
      projectType: ['all'],
      projectTypeGroup: ['all'],
      project: ['all'],
      portfolio: ['all'],
      projectManager: ['all'],
      allocationManager: ['all'],
    });
  };

  const getSelectedFiltersCount = () => {
    let count = 0;
    if (filters.reportType !== 'allocation_actuals') count++;
    
    // Check period as string
    if (filters.period !== 'last_week') count++;
    
    // Check arrays - count as active if not ['all'] or empty
    if (Array.isArray(filters.project) && filters.project.length > 0 && 
        !(filters.project.length === 1 && filters.project[0] === 'all')) count++;
    if (Array.isArray(filters.team) && filters.team.length > 0 && 
        !(filters.team.length === 1 && filters.team[0] === 'all')) count++;
    if (Array.isArray(filters.organization) && filters.organization.length > 0 && 
        !(filters.organization.length === 1 && filters.organization[0] === 'all')) count++;
    if (Array.isArray(filters.resourceType) && filters.resourceType.length > 0 && 
        !(filters.resourceType.length === 1 && filters.resourceType[0] === 'all')) count++;
    if (Array.isArray(filters.resource) && filters.resource.length > 0 && 
        !(filters.resource.length === 1 && filters.resource[0] === 'all')) count++;
    if (Array.isArray(filters.projectType) && filters.projectType.length > 0 && 
        !(filters.projectType.length === 1 && filters.projectType[0] === 'all')) count++;
    if (Array.isArray(filters.projectTypeGroup) && filters.projectTypeGroup.length > 0 && 
        !(filters.projectTypeGroup.length === 1 && filters.projectTypeGroup[0] === 'all')) count++;
    if (Array.isArray(filters.portfolio) && filters.portfolio.length > 0 && 
        !(filters.portfolio.length === 1 && filters.portfolio[0] === 'all')) count++;
    if (Array.isArray(filters.projectManager) && filters.projectManager.length > 0 && 
        !(filters.projectManager.length === 1 && filters.projectManager[0] === 'all')) count++;
    if (Array.isArray(filters.allocationManager) && filters.allocationManager.length > 0 && 
        !(filters.allocationManager.length === 1 && filters.allocationManager[0] === 'all')) count++;
    
    return count;
  };

  // DataGrid columns configuration
  const columns: GridColDef[] = [
    { field: 'resources', headerName: 'RESOURCES', width: 150, sortable: true },
    { field: 'resourceType', headerName: 'RESOURCE TYPE', width: 130 },
    { field: 'team', headerName: 'TEAM', width: 120 },
    { field: 'organization', headerName: 'ORGANIZATION', width: 140 },
    { field: 'allocationManager', headerName: 'ALLOCATION MANAGER', width: 170 },
    { field: 'project', headerName: 'PROJECT NAME', width: 160 },
    { field: 'projectType', headerName: 'PROJECT TYPE', width: 130 },
    { field: 'projectPortfolio', headerName: 'PROJECT PORTFOLIO', width: 160 },
    { field: 'projectManager', headerName: 'PROJECT MANAGER', width: 170 },
    { field: 'weekPeriod', headerName: 'WEEK/PERIOD', width: 120 },
    {
      field: 'planned',
      headerName: 'PLANNED',
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'actual',
      headerName: 'ACTUAL',
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'hourlyCost',
      headerName: 'HOURLY COST',
      width: 120,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => `$${params}`,
    },
    {
      field: 'allocationCost',
      headerName: 'ALLOCATION COST',
      width: 150,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => `$${params}`,
    },
    {
      field: 'actualCost',
      headerName: 'ACTUAL COST',
      width: 130,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => `$${params}`,
    },
    {
      field: 'plannedRevenue',
      headerName: 'PLANNED REVENUE',
      width: 150,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (params) => `$${params}`,
    },
    {
      field: 'projectAllocation',
      headerName: 'PROJECT ALLOCATION',
      width: 160,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <ReportBuilderToolbar
        onGenerateReport={handleGenerateReport}
        onExport={handleExport}
        onShare={handleShare}
        isLoading={isLoading}
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
                checkboxSelection
                disableRowSelectionOnClick
                slots={{
                  toolbar: ReportBuilderDataGridToolbar,
                }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#F9FAFB',
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
