import { GridColDef } from '@mui/x-data-grid';
import { ReportType } from '@/app/types/dashboardTypes';
import { Box } from '@mui/material';
import { StatusPill, ScorePill } from '../../Settings/styled';
import { useSelector } from 'react-redux';
import { getAllocationManagerFromPath } from '@/app/utils/common';

const renderScoreCell = (params: any) => {
  const rawValue = Number(params.value ?? 0);
  const value = Number.isNaN(rawValue) ? 0 : rawValue;
  const displayValue = `${Math.round(value)}%`;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <ScorePill score={value}>{displayValue}</ScorePill>
    </Box>
  );
};
const GetUsers = (): any[] => {
  const { user } = useSelector((state: any) => state.rbac);
  if (!Array.isArray(user)) return [];
  return user;
};

const GetResources = (): any[] => {
  const { resources } = useSelector((state: any) => state.resources);
  if (!Array.isArray(resources)) return [];
  return resources;
};

const formatCurrency = (amount:any, currency = 'USD', locale = 'en-US') => {
  try {
    // Handle null, undefined, or non-numeric values
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return '';
    }
    
    // Fallback to USD if currency is invalid or undefined
    const validCurrency = currency && typeof currency === 'string' && currency.length === 3 ? currency : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  } catch (err) {
    console.error('Currency formatting error:', err);
    return '-';
  }
}

const GetName = (uid: string): string => {
  const users = GetUsers();
  const user = users.find((u: any) => u.id === uid);
  if (!user) return uid;
  const { firstName, lastName } = user;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  return uid;
};

const projectsOnlyColumns: GridColDef[] = [
  { field: 'project_name', headerName: 'Project', minWidth: 180, flex: 1 },
  { field: 'project_id', headerName: 'Project ID', minWidth: 120 },
  { field: 'description', headerName: 'Description', minWidth: 200 },
  {
    field: 'status', headerName: 'Project Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'location', headerName: 'Location', minWidth: 140 },
  { field: 'start_date', headerName: 'Start Date', minWidth: 120 },
  { field: 'end_date', headerName: 'End Date', minWidth: 120 },
  { field: 'budget', headerName: 'Budget', minWidth: 110, type: 'number', headerAlign: 'left', align: 'right', availableAggregationFunctions: ['min', 'max', 'avg', 'sum'], renderCell: (params: any) => formatCurrency(params.value, params.row?.budget_currency) },
  { field: 'budget_currency', headerName: 'Budget Currency', minWidth: 150 },
  { field: 'allow_overtime', headerName: 'Allow Overtime', minWidth: 140,
    renderCell: (params: any) => (
      params.value && params.value === true ? 'Yes' : 'No'
    )
   },
  { field: 'project_type', headerName: 'Project Type', minWidth: 140 },
  { field: 'project_type_group', headerName: 'Project Type Group', minWidth: 160 },
  {
    field: 'project_type_color', headerName: 'Project Type Color', minWidth: 160,
    renderCell: (params: any) => {
      const color: string = params.value;
      return color ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'start',
            gap: 1,
            paddingLeft: '5%',
            width: '100%',
            height: '100%',
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '4px',
              backgroundColor: color,
              border: '1px solid #ccc',
            }}
          />
          {color}
        </Box>
      ) : null;
    }
  },
  { field: 'portfolio_name', headerName: 'Portfolio', minWidth: 140 },
  {
    field: 'portfolio_status', headerName: 'Portfolio Status', minWidth: 160,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'project_manager', headerName: 'Project Manager', minWidth: 160 },
  { field: 'project_manager_email', headerName: 'Project Manager Email', minWidth: 200 },
  { field: 'project_sponsor', headerName: 'Project Sponsor', minWidth: 160 },
  { field: 'project_sponsor_email', headerName: 'Project Sponsor Email', minWidth: 200 },
  { field: 'created', headerName: 'Created On', minWidth: 120 },
  {
    field: 'created_by', headerName: 'Created By', minWidth: 160,
    renderCell: (params) => GetName(params.value)
  },
  { field: 'last_modified', headerName: 'Last Modified On', minWidth: 140 },
  {
    field: 'last_modified_by', headerName: 'Last Modified By', minWidth: 180,
    renderCell: (params) => GetName(params.value),
  },
];

const resourceOnlyColumns: GridColDef[] = [
  { field: 'resource_id', headerName: 'Resource ID', minWidth: 120 },
  { field: 'resource_name', headerName: 'Resource', minWidth: 160, flex: 1 },
  { field: 'first_name', headerName: 'First Name', minWidth: 140 },
  { field: 'preferred_first_name', headerName: 'Preferred First Name', minWidth: 180 },
  { field: 'last_name', headerName: 'Last Name', minWidth: 140 },
  { field: 'email', headerName: 'Email', minWidth: 200 },
  { field: 'phone_number', headerName: 'Phone Number', minWidth: 160 },
  { field: 'department', headerName: 'Department', minWidth: 140 },
  { field: 'role', headerName: 'Title', minWidth: 140 },
  { field: 'hr_level', headerName: 'HR Level', minWidth: 100 },
  { field: 'resource_type', headerName: 'Resource Type', minWidth: 140 },
  { field: 'contractor_hourly_rate', headerName: 'Contractor Hourly Rate', minWidth: 180, type: 'number', headerAlign: 'left', align: 'right', availableAggregationFunctions: ['min', 'max', 'avg', 'sum'], renderCell: (params: any) => formatCurrency(params.value, params.row?.contractor_hourly_rate_currency)},
  { field: 'contractor_hourly_rate_currency', headerName: 'Contractor Hourly Rate Currency', minWidth: 220 },
  { field: 'manager_name', headerName: 'Manager Name', minWidth: 160 },
  { field: 'team_name', headerName: 'Team Name', minWidth: 140 },
  { field: 'allocation_manager', headerName: 'Allocation Manager', minWidth: 180, renderCell: (params) => getAllocationManagerFromPath(params.value, GetResources())?.FullName || params.value },
  { field: 'organization', headerName: 'Organization', minWidth: 160 },
  { field: 'work_location', headerName: 'Resource Location', minWidth: 160 },
  { field: 'work_location_group', headerName: 'Resource Location Group', minWidth: 180 },
  { field: 'location_category', headerName: 'Location Category', minWidth: 160 },
  { field: 'start_date', headerName: 'Start Date', minWidth: 120 },
  { field: 'end_date', headerName: 'End Date', minWidth: 120 },
  {
    field: 'status', headerName: 'Resource Status', minWidth: 150,
    renderCell: (params: any) => (
     params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'user_id', headerName: 'User ID', minWidth: 120 },
  { field: 'created', headerName: 'Created On', minWidth: 120 },
  {
    field: 'created_by', headerName: 'Created By', minWidth: 160,
    renderCell: (params) => GetName(params.value),
  },
  { field: 'last_modified', headerName: 'Last Modified On', minWidth: 140 },
  {
    field: 'last_modified_by', headerName: 'Last Modified By', minWidth: 180,
    renderCell: (params) => GetName(params.value),
  },
];

const projectPeriodColumns: GridColDef[] = [
  { field: 'project_id', headerName: 'Project ID', minWidth: 120 },
  { field: 'project_name', headerName: 'Project', minWidth: 200, flex: 1 },
  { field: 'project_type', headerName: 'Project Type', minWidth: 140 },
  { field: 'project_type_group', headerName: 'Project Type Group', minWidth: 160 },
  { field: 'status', headerName: 'Project Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'portfolio_name', headerName: 'Portfolio', minWidth: 140 },
  { field: 'project_manager', headerName: 'Project Manager', minWidth: 160 },
  { field: 'project_manager_email', headerName: 'Project Manager Email', minWidth: 200 },
  { field: 'period', headerName: 'Period', minWidth: 120 },
  { field: 'planned_allocation', headerName: 'Plan', minWidth: 170, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'actual_allocation', headerName: 'Actuals', minWidth: 170, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'variance', headerName: 'Variance', minWidth: 170, type: 'number', headerAlign: 'left', align: 'right'},
  { field: 'health_score', headerName: 'Project Health Score', minWidth: 130, renderCell: renderScoreCell },
  { field: 'adherence_score', headerName: 'Project Adherence Score', minWidth: 150, renderCell: renderScoreCell },
  { field: 'engagement_score', headerName: 'Project Engagement Score', minWidth: 150, renderCell: renderScoreCell },
  { field: 'project_actuals_status_score', headerName: 'Project Actuals Status Score', minWidth: 180 },
  { field: 'created', headerName: 'Created On', minWidth: 120 },
  {
    field: 'created_by', headerName: 'Created By', minWidth: 160,
    renderCell: (params) => GetName(params.value),
  },
  { field: 'last_modified', headerName: 'Last Modified On', minWidth: 140 },
  {
    field: 'last_modified_by', headerName: 'Last Modified By', minWidth: 180,
    renderCell: (params) => GetName(params.value),
  },
];

const resourcePeriodColumns: GridColDef[] = [
  { field: 'resource_name', headerName: 'Resource', minWidth: 180, flex: 1 },
  { field: 'resource_type', headerName: 'Resource Type', minWidth: 140 },
  { field: 'status', headerName: 'Resource Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'resource_location', headerName: 'Resource Location', minWidth: 160 },
  { field: 'resource_location_group', headerName: 'Resource Location Group', minWidth: 180 },
  { field: 'team_name', headerName: 'Team', minWidth: 160 },
  { field: 'organization_name', headerName: 'Organization', minWidth: 160 },
  {
    field: 'allocation_manager', headerName: 'Allocation Manager', minWidth: 180,
    renderCell: (params) => getAllocationManagerFromPath(params.value, GetResources())?.FullName || params.value,
  },
  { field: 'period', headerName: 'Period', minWidth: 120 },
  {
    field: 'actuals_status', headerName: 'Resource Actuals Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'planned_allocation', headerName: 'Plan', minWidth: 170, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'actuals_allocation', headerName: 'Actuals', minWidth: 170, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'variance', headerName: 'Variance', minWidth: 170, type: 'number', headerAlign: 'left', align: 'right'},
  { field: 'planning_score', headerName: 'Planning Score', minWidth: 140, renderCell: renderScoreCell },
  { field: 'actuals_score', headerName: 'Actuals Score', minWidth: 140, renderCell: renderScoreCell },
  { field: 'confirmation_score', headerName: 'Confirmation Score', minWidth: 160, renderCell: renderScoreCell },
  { field: 'entry_score', headerName: 'Entry Score', minWidth: 120, renderCell: renderScoreCell },
  { field: 'communication_score', headerName: 'Communication Score', minWidth: 180, renderCell: renderScoreCell },
  { field: 'engagement_score', headerName: 'Engagement Score', minWidth: 150, renderCell: renderScoreCell },
  { field: 'created', headerName: 'Created On', minWidth: 120 },
  {
    field: 'created_by', headerName: 'Created By', minWidth: 160,
    renderCell: (params) => GetName(params.value),
  },
  { field: 'last_modified', headerName: 'Last Modified On', minWidth: 140 },
  {
    field: 'last_modified_by', headerName: 'Last Modified By', minWidth: 180,
    renderCell: (params) => GetName(params.value),
  },
];

const resourceProjectPeriodColumns: GridColDef[] = [
  { field: 'resource_name', headerName: 'Resource', minWidth: 180, flex: 1 },
  { field: 'resource_type', headerName: 'Resource Type', minWidth: 140 },
  { field: 'resource_status', headerName: 'Resource Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'resource_location', headerName: 'Resource Location', minWidth: 160 },
  { field: 'resource_location_group', headerName: 'Resource Location Group', minWidth: 180 },
  { field: 'team_name', headerName: 'Team', minWidth: 160 },
  { field: 'organization_name', headerName: 'Organization', minWidth: 160 },
  {
    field: 'allocation_manager', headerName: 'Allocation Manager', minWidth: 180,
    renderCell: (params) => getAllocationManagerFromPath(params.value, GetResources())?.FullName || params.value,
  },
  { field: 'project_name', headerName: 'Project', minWidth: 200 },
  { field: 'project_status', headerName: 'Project Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'project_type_group', headerName: 'Project Type Group', minWidth: 160 },
  { field: 'project_type', headerName: 'Project Type', minWidth: 140 },
  { field: 'portfolio_name', headerName: 'Portfolio', minWidth: 140 },
  { field: 'project_manager', headerName: 'Project Manager', minWidth: 160 },
  { field: 'period', headerName: 'Period', minWidth: 120 },
  { field: 'planned', headerName: 'Plan', minWidth: 110, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'actual', headerName: 'Actuals', minWidth: 110, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'variance', headerName: 'Variance', minWidth: 110, type: 'number', headerAlign: 'left', align: 'right'},
  {
    field: 'project_actuals_status', headerName: 'Project Actuals Status', minWidth: 150,
    renderCell: (params: any) => (
     params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'created', headerName: 'Created On', minWidth: 120 },
  {
    field: 'created_by', headerName: 'Created By', minWidth: 160,
    renderCell: (params) => GetName(params.value),
  },
  { field: 'last_modified', headerName: 'Last Modified On', minWidth: 140 },
  {
    field: 'last_modified_by', headerName: 'Last Modified By', minWidth: 180,
    renderCell: (params) => GetName(params.value),
  },
];

const resourceProjectPeriodCostColumns: GridColDef[] = [
  { field: 'resource_name', headerName: 'Resource', minWidth: 220, flex: 1 },
  { field: 'resource_type', headerName: 'Resource Type', minWidth: 140 },
  { field: 'resource_status', headerName: 'Resource Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'resource_location', headerName: 'Resource Location', minWidth: 160 },
  { field: 'resource_location_group', headerName: 'Resource Location Group', minWidth: 180 },
  { field: 'team_name', headerName: 'Team', minWidth: 160 },
  { field: 'organization_name', headerName: 'Organization', minWidth: 160 },
  {
    field: 'allocation_manager', headerName: 'Allocation Manager', minWidth: 180,
    renderCell: (params) => getAllocationManagerFromPath(params.value, GetResources())?.FullName || params.value,
  },
  { field: 'project_name', headerName: 'Project', minWidth: 200 },
  { field: 'project_type_group', headerName: 'Project Type Group', minWidth: 160 },
  { field: 'project_type', headerName: 'Project Type', minWidth: 140 },
  { field: 'project_status', headerName: 'Project Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'portfolio_name', headerName: 'Portfolio', minWidth: 140 },
  { field: 'project_manager', headerName: 'Project Manager', minWidth: 160 },
  { field: 'period', headerName: 'Period', minWidth: 120 },
  { field: 'planned', headerName: 'Plan', minWidth: 110, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'actual', headerName: 'Actuals', minWidth: 110, type: 'number', headerAlign: 'left', align: 'right' },
  { field: 'variance', headerName: 'Variance', minWidth: 110, type: 'number', headerAlign: 'left', align: 'right'},
  { field: 'hourly_rate', headerName: 'Hourly Rate', minWidth: 130, type: 'number', headerAlign: 'left', align: 'right', availableAggregationFunctions: ['min', 'max', 'avg', 'sum'], renderCell: (params: any) => formatCurrency(params.value, params.row?.currency) },
  { field: 'currency', headerName: 'Currency', minWidth: 100 },
  { field: 'actual_cost', headerName: 'Actual Cost', minWidth: 130, type: 'number', headerAlign: 'left', align: 'right', availableAggregationFunctions: ['min', 'max', 'avg', 'sum'], renderCell: (params: any) => formatCurrency(params.value, params.row?.currency) },
  { field: 'planned_cost', headerName: 'Planned Cost', minWidth: 130, type: 'number', headerAlign: 'left', align: 'right', availableAggregationFunctions: ['min', 'max', 'avg', 'sum'], renderCell: (params: any) => formatCurrency(params.value, params.row?.currency) },
  {
    field: 'project_actuals_status', headerName: 'Project Actuals Status', minWidth: 150,
    renderCell: (params: any) => (
      params.value && <StatusPill status={params.value}>{params.value}</StatusPill>
    ),
  },
  { field: 'created', headerName: 'Created On', minWidth: 120 },
  {
    field: 'created_by', headerName: 'Created By', minWidth: 160,
    renderCell: (params) => GetName(params.value),
  },
  { field: 'last_modified', headerName: 'Last Modified On', minWidth: 140 },
  {
    field: 'last_modified_by', headerName: 'Last Modified By', minWidth: 180,
    renderCell: (params) => GetName(params.value),
  },
];

export const getReportColumns = (reportType: ReportType): GridColDef[] => {
  switch (reportType) {
    case 'projectsOnly':
      return projectsOnlyColumns;
    case 'resourceOnly':
      return resourceOnlyColumns;
    case 'projectPeriod':
      return projectPeriodColumns;
    case 'resourcePeriod':
      return resourcePeriodColumns;
    case 'resourceProjectPeriod':
      return resourceProjectPeriodColumns;
    case 'resourceProjectPeriodCost':
      return resourceProjectPeriodCostColumns;
    default:
      return projectsOnlyColumns;
  }
};

export const getHiddenColumns = (reportType: ReportType): Record<string, boolean> => {

  const commonHidden = {
    created: false,
    created_by: false,
    last_modified: false,
    last_modified_by: false,
  };

  switch (reportType) {
    case 'projectsOnly':
      return {
        ...commonHidden,
        project_id: false,
        status: false,
        description: false,
        location: false,
        allow_overtime: false,
        project_type_color: false,
        budget_currency: false,
        portfolio_status: false,
        project_manager_email: false,
        project_sponsor_email: false,
      };

    case 'resourceOnly':
      return {
        ...commonHidden,
        resource_id: false,
        first_name: false,
        phone_number: false,
        status: false,
        preferred_first_name: false,
        last_name: false,
        contractor_hourly_rate: false,
        contractor_hourly_rate_currency: false,
        location_category: false,
        user_id: false,
      };

    case 'projectPeriod':
      return {
        ...commonHidden,
        project_id: false,
        project_manager_email: false,
        status: false,
        adherence_score: false,
        engagement_score: false,
        project_actuals_status_score: false,
      };

    case 'resourcePeriod':
      return {
        ...commonHidden,
        status: false,
        resource_location: false,
        resource_location_group: false,
        planning_score: false,
        actuals_score: false,
        confirmation_score: false,
        entry_score: false,
        communication_score: false,
      };

    case 'resourceProjectPeriod':
      return {
        ...commonHidden,
      };

    case 'resourceProjectPeriodCost':
      return {
        ...commonHidden,
        currency: false,
      };

    default:
      return commonHidden;
  }
};
