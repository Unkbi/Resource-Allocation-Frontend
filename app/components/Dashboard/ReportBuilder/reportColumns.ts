import { GridColDef } from '@mui/x-data-grid';
import { ReportType } from '@/app/types/dashboardTypes';

const projectsOnlyColumns: GridColDef[] = [
  { field: 'project_name', headerName: 'PROJECT NAME', minWidth: 180, flex: 1 },
  { field: 'project_id', headerName: 'PROJECT ID', minWidth: 120 },
  { field: 'project_type', headerName: 'PROJECT TYPE', minWidth: 140 },
  { field: 'project_type_group', headerName: 'PROJECT TYPE GROUP', minWidth: 160 },
  { field: 'portfolio', headerName: 'PORTFOLIO', minWidth: 140 },
  { field: 'project_manager', headerName: 'PROJECT MANAGER', minWidth: 160 },
  { field: 'team_name', headerName: 'TEAM NAME', minWidth: 140 },
  { field: 'organization_name', headerName: 'ORGANIZATION', minWidth: 160 },
  { field: 'planned', headerName: 'PLANNED', minWidth: 110, type: 'number' },
  { field: 'actual', headerName: 'ACTUAL', minWidth: 110, type: 'number' },
  { field: 'project_actuals_status', headerName: 'PROJECT ACTUALS STATUS', minWidth: 180 },
];

const resourceOnlyColumns: GridColDef[] = [
  { field: 'resource_id', headerName: 'RESOURCE ID', minWidth: 120 },
  { field: 'full_name', headerName: 'FULL NAME', minWidth: 160, flex: 1 },
  { field: 'department', headerName: 'DEPARTMENT', minWidth: 140 },
  { field: 'role', headerName: 'ROLE', minWidth: 140 },
  { field: 'hr_level', headerName: 'HR LEVEL', minWidth: 100 },
  { field: 'resource_type', headerName: 'RESOURCE TYPE', minWidth: 140 },
  { field: 'team_name', headerName: 'TEAM NAME', minWidth: 140 },
  { field: 'organization', headerName: 'ORGANIZATION', minWidth: 160 },
  { field: 'work_location', headerName: 'WORK LOCATION', minWidth: 160 },
  { field: 'start_date', headerName: 'START DATE', minWidth: 120 },
  { field: 'end_date', headerName: 'END DATE', minWidth: 120 },
  { field: 'status', headerName: 'STATUS', minWidth: 100 },
];

const projectPeriodColumns: GridColDef[] = [
  { field: 'project_name', headerName: 'PROJECT NAME', minWidth: 200, flex: 1 },
  { field: 'team_name', headerName: 'TEAM NAME', minWidth: 160 },
  { field: 'organization_name', headerName: 'ORGANIZATION', minWidth: 160 },
  { field: 'period', headerName: 'PERIOD', minWidth: 120 },
  { field: 'planned', headerName: 'PLANNED', minWidth: 110, type: 'number' },
  { field: 'actual', headerName: 'ACTUAL', minWidth: 110, type: 'number' },
  { field: 'project_actuals_status', headerName: 'PROJECT ACTUALS STATUS', minWidth: 180 },
  { field: 'health_score', headerName: 'HEALTH SCORE', minWidth: 130 },
  { field: 'adherence_score', headerName: 'ADHERENCE SCORE', minWidth: 150 },
  { field: 'engagement_score', headerName: 'ENGAGEMENT SCORE', minWidth: 150 },
];

const resourcePeriodColumns: GridColDef[] = [
  { field: 'resource_name', headerName: 'RESOURCE NAME', minWidth: 180, flex: 1 },
  { field: 'resource_type', headerName: 'RESOURCE TYPE', minWidth: 140 },
  { field: 'team_name', headerName: 'TEAM NAME', minWidth: 160 },
  { field: 'organization_name', headerName: 'ORGANIZATION', minWidth: 160 },
  { field: 'period', headerName: 'PERIOD', minWidth: 120 },
  { field: 'planned_allocation', headerName: 'PLANNED ALLOCATION', minWidth: 170, type: 'number' },
  { field: 'actuals_allocation', headerName: 'ACTUALS ALLOCATION', minWidth: 170, type: 'number' },
  { field: 'planning_score', headerName: 'PLANNING SCORE', minWidth: 140 },
  { field: 'actuals_score', headerName: 'ACTUALS SCORE', minWidth: 140 },
  { field: 'contribution_score', headerName: 'CONTRIBUTION SCORE', minWidth: 160 },
  { field: 'entry_score', headerName: 'ENTRY SCORE', minWidth: 120 },
  { field: 'communication_score', headerName: 'COMMUNICATION SCORE', minWidth: 180 },
  { field: 'engagement_score', headerName: 'ENGAGEMENT SCORE', minWidth: 150 },
];

const resourceProjectPeriodColumns: GridColDef[] = [
  { field: 'resource_name', headerName: 'RESOURCE NAME', minWidth: 180, flex: 1 },
  { field: 'project_name', headerName: 'PROJECT NAME', minWidth: 200 },
  { field: 'project_type_group', headerName: 'PROJECT TYPE GROUP', minWidth: 160 },
  { field: 'period', headerName: 'PERIOD', minWidth: 120 },
  { field: 'planned', headerName: 'PLANNED', minWidth: 110, type: 'number' },
  { field: 'actual', headerName: 'ACTUAL', minWidth: 110, type: 'number' },
  { field: 'status', headerName: 'STATUS', minWidth: 110 },
];

const resourceProjectPeriodCostColumns: GridColDef[] = [
  { field: 'resource_name', headerName: 'RESOURCE NAME', minWidth: 180, flex: 1 },
  { field: 'project_name', headerName: 'PROJECT NAME', minWidth: 200 },
  { field: 'period', headerName: 'PERIOD', minWidth: 120 },
  { field: 'allocated_units', headerName: 'ALLOCATED UNITS', minWidth: 160, type: 'number' },
  { field: 'planned', headerName: 'PLANNED', minWidth: 110, type: 'number' },
  { field: 'actual', headerName: 'ACTUAL', minWidth: 110, type: 'number' },
  { field: 'cost', headerName: 'COST', minWidth: 140, type: 'number' },
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
