'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  styled,
  Tooltip,
  Menu,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft';
import { ArrowDropDown } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangeCalendar } from '@mui/x-date-pickers-pro/DateRangeCalendar';
import { DateRange } from '@mui/x-date-pickers-pro/models';
import { RootState, AppDispatch } from '@/app/redux/store';
import StyledAutocomplete from '../../Select/Autocomplete';
import { FETCH_PROJECT_TYPE_GROUPS, FETCH_PROJECT_TYPES } from '@/app/redux/actions/allSettingsActions';
import { fetchAllTeams } from '@/app/redux/actions/fetchTeamsAction';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { FETCH_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { FETCH_ORGANISATIONS } from '@/app/redux/actions/organizationsAction';
import { getAllocationManagerFromPath, getResourceFromUid } from '@/app/utils/common';
import FilterChips from '../FilterChips';
import { isFilterEnabled, isPeriodRequired } from './reportFilterConfig';
import { isSummaryFilterEnabled, isSummaryPeriodRequired } from './summaryFilterConfig';
import { ReportType, SummaryType } from '@/app/types/dashboardTypes';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import { FETCH_ROLES } from '@/app/redux/actions/rbacActions';

const StyledChip = styled(Chip)(({ theme }) => ({
  height: '32px',
  borderRadius: '6px',
  backgroundColor: '#F1F5F9',
  border: '1px solid #E2E8F0',
  fontFamily: 'Open Sans',
  fontSize: '13px',
  fontWeight: 400,
  color: '#334665',
  maxWidth: '400px',
  '& .MuiChip-label': {
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .MuiChip-deleteIcon': {
    color: '#64748B',
    fontSize: '16px',
    margin: '0 4px 0 -2px',
    '&:hover': {
      color: '#475569',
    },
  },
}));

const CountBadge = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#334665',
  cursor: 'pointer',
  marginLeft: '4px',
  flexShrink: 0,
});

export interface ReportFilters {
  reportType: ReportType;
  summaryType?: SummaryType; // Added for AI Summary mode
  period: string;
  customDateRange?: DateRange<Dayjs>;
  projectManager: string[];
  allocationManager: string[];
  team: string[];
  organization: string[];
  resourceType: string[];
  resource: string[];
  projectType: string[];
  projectTypeGroup: string[];
  project: string[];
  portfolio: string[];
  resourceStatuses: string[];
  resourceLocations: string[];
  resourceWorkLocationGroup: string[];
  projectStatuses: string[];
  userStatuses: string[];
  userRoles: string[];
  show_actuals?: boolean; // For custom tab
}

interface FilterSectionProps {
  disabled?: boolean;
  title: string;
  name: string;
  options: Array<{ label: string; value: string }>;
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  formikProps: any;
  placeholder?: string;
  multiple?: boolean;
}

const FilterSection = ({
  disabled = true,
  title,
  name,
  options,
  selected,
  onChange,
  formikProps,
  placeholder = 'All',
  multiple = true,
}: FilterSectionProps) => {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#1C2D5F',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <StyledAutocomplete
        disabled={disabled}
        name={name}
        label={placeholder}
        placeholder={placeholder}
        options={options}
        value={selected || (multiple ? [] : '')}
        formikProps={formikProps}
        onChange={(value) => onChange(value)}
        disableClearable={false}
        multiple={multiple}
      />
    </Box>
  );
};

interface ReportBuilderFiltersProps {
  expanded: boolean;
  onToggle: () => void;
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onResetFilters: () => void;
  mode?: 'reports' | 'aisummary' | 'custom'; // Mode to determine which filters to show
  permissions?: Record<string, CrudPermissions>
  customReportType?: 'percentageAllocation' | 'allocationCapacity'; // For custom tab
}

function ReportBuilderFilters({
  expanded,
  onToggle,
  filters,
  onFiltersChange,
  onResetFilters,
  mode = 'reports',
  permissions,
  customReportType,
}: ReportBuilderFiltersProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Helper to check if filter is enabled based on mode
  const checkFilterEnabled = (filterKey: string): boolean => {
    if (mode === 'custom') {
      // For custom tab, only show specific filters
      return [ 'project','projectType', 'projectTypeGroup','team', 'organization'].includes(filterKey);
    }
    if (mode === 'aisummary' && filters.summaryType) {
      return isSummaryFilterEnabled(filters.summaryType, filterKey as any);
    }
    return isFilterEnabled(filters.reportType, filterKey as any);
  };
  
  // Helper to check if period is required based on mode
  const checkPeriodRequired = (): boolean => {
    if (mode === 'custom') {
      return true; // Custom tab requires period
    }
    if (mode === 'aisummary' && filters.summaryType) {
      return isSummaryPeriodRequired(filters.summaryType);
    }
    return isPeriodRequired(filters.reportType);
  };
  
  // Custom date range picker state
  const [customDateSubmenuAnchor, setCustomDateSubmenuAnchor] = useState<null | HTMLElement>(null);
  const [tempDateRange, setTempDateRange] = useState<DateRange<Dayjs>>(filters.customDateRange || [null, null]);
  
  // Redux selectors
  const { projectTypeGroups, projectTypes, location, locationGroups } = useSelector((state: RootState) => state.allSettings);
  const { portfolios } = useSelector((state: RootState) => state.portfolios);
  const { teams } = useSelector((state: RootState) => state.teams);
  const { resources } = useSelector((state: RootState) => state.resources);
  const { organisations } = useSelector((state: RootState) => state.organisations);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { user: rbacUsers, roles } = useSelector((state: RootState) => state.rbac);

  // Create a dummy formik instance for StyledAutocomplete
  const formikProps = useFormik({
    initialValues: filters,
    onSubmit: () => { },
    enableReinitialize: true,
  });

  // Fetch data on mount
  useEffect(() => {
    if (projectTypeGroups.length === 0) {
      dispatch({ type: FETCH_PROJECT_TYPE_GROUPS });
    }
    if (!teams?.length) {
      dispatch(fetchAllTeams());
    }
    if (!projects?.length) {
      dispatch(fetchAllProjects());
    }
    if (!resources?.length) {
      dispatch({
        type: FETCH_ALL_RESOURCES_DETAIL,
        payload: {},
      });
    }
    if (!portfolios?.length) {
      dispatch({
        type: FETCH_PORTFOLIOS,
        payload: {},
      });
    }
    if (!organisations?.length) {
      dispatch({
        type: FETCH_ORGANISATIONS,
        payload: {},
      });
    }
    if (projectTypes.length === 0) {
      dispatch({ type: FETCH_PROJECT_TYPES });
    }

    if(!roles || roles.length === 0)
    {
      dispatch({type: FETCH_ROLES});
    }
  }, [dispatch, projectTypeGroups.length, teams?.length, projects?.length, resources?.length, portfolios?.length, organisations?.length, projectTypes.length, roles?.length]);

  // Helper function to sort options alphabetically by label
  const sortOptions = (options: Array<{ label: string; value: string }>) => {
    return [...options].sort((a, b) => a.label.localeCompare(b.label));
  };

  const reportTypes = [
    { label: 'Resource, Project, Period & Cost', value: 'resource_project_period_cost', group: 'Allocation & Cost Analysis' },
    { label: 'Allocation & Actuals', value: 'allocation_actuals', group: 'Allocation & Cost Analysis' },
    { label: 'Resource & Period', value: 'resource_period', group: 'Two Dimension Views' },
    { label: 'Project & Period', value: 'project_period', group: 'Two Dimension Views' },
    { label: 'Resource Only', value: 'resource_only', group: 'Single Dimension Views' },
    { label: 'Project Only', value: 'project_only', group: 'Single Dimension Views' },
    { label: 'User Activity Report', value: 'user_activity', group: 'Single Dimension Views' },
  ];

  // Prepare options from Redux data
  const projectTypeGroupOptions = [
    ...sortOptions(
      projectTypeGroups?.map((projectTypeGroup: any) => ({
        value: projectTypeGroup.Id,
        label: projectTypeGroup.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  const projectTypeOptions = [
    ...sortOptions(
      projectTypes?.map((projectType: any) => ({
        value: projectType.Id,
        label: projectType.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  const teamOptions = [
    ...sortOptions(
      teams?.map((team: any) => ({
        value: team.Id,
        label: team.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  const resourceOptions = [
    ...sortOptions(
      resources?.map((resource: any) => ({
        value: resource.Id,
        label: resource.FullName ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  const portfolioOptions = [
    ...sortOptions(
      portfolios?.map((portfolio: any) => ({
        value: portfolio.Id,
        label: portfolio.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  const organizationOptions = [
    ...sortOptions(
      organisations?.map((organisation: any) => ({
        value: organisation.Id,
        label: organisation.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  const projectOptions = [
    ...sortOptions(
      projects?.map((project: any) => ({
        value: project.Id,
        label: project.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // Get unique allocation managers from teams
  const allocationManagers = teams?.map((team: any) => {
    const manager = team && getAllocationManagerFromPath(team.AllocationManager, resources);
    return {
      value: manager ? manager.Id : '',
      label: manager ? manager.FullName : '',
    };
  }) || [];

  const allocationManagerOptions = [
    ...sortOptions(
      Array.from(
        new Map(
          allocationManagers
            .filter(option => option.value !== '')
            .map(option => [option.value, option])
        ).values()
      )
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // Get unique project managers from projects
  const projectManagers = projects?.map((project: any) => {
    const manager = project && getResourceFromUid(project.ProjectManager, resources);
    return {
      value: manager ? manager.Id : '',
      label: manager ? manager.FullName : '',
    };
  }) || [];

  const projectManagerOptions = [
    ...sortOptions(
      Array.from(
        new Map(
          projectManagers
            .filter(option => option.value !== '')
            .map(option => [option.value, option])
        ).values()
      )
    ),
    { value: '_BLANK_', label: '(Blanks)' },
  ];

  const resourceTypeOptions = [
    ...sortOptions([...new Set(resources?.map((res: any) => res.Type))].map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    }))),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // Resource Status Options
  const resourceStatusOptions = [
    ...sortOptions(
      [...new Set(resources?.map((res: any) => res.Status).filter(Boolean))].map((status: string) => ({
        value: status,
        label: status,
      }))
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // Resource Locations Options
  const resourceLocationOptions = [
    ...sortOptions(
      location?.map((loc: any) => ({
        value: loc.Id,
        label: loc.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // Resource Work Location Group Options
  const resourceWorkLocationGroupOptions = [
    ...sortOptions(
      locationGroups?.map((locGroup: any) => ({
        value: locGroup.Id,
        label: locGroup.Name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // Project Status Options
  const projectStatusOptions = [
    ...sortOptions(
      [...new Set(projects?.map((proj: any) => proj.Status).filter(Boolean))].map((status: string) => ({
        value: status,
        label: status,
      }))
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // User Status Options (from RBAC users)
  const userStatusOptions = [
    ...sortOptions(
      [...new Set(rbacUsers?.map((user: any) => user.status).filter(Boolean))].map((status: string) => ({
        value: status,
        label: status,
      }))
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // User Roles Options (from RBAC roles)
  const userRoleOptions = [
    ...sortOptions(
      roles?.map((role: any) => ({
        value: role.name,
        label: role.name ?? '',
      })) || []
    ),
    { value: '_BLANK_', label: '(Blanks)' }
  ];

  // Report filter labels for FilterChips component
  const reportFilterLabels: Record<string, string> = {
    period: 'Period',
    projectManager: 'Project Manager',
    allocationManager: 'Allocation Manager',
    team: 'Team',
    organization: 'Organization',
    resourceType: 'Resource Type',
    resource: 'Resource',
    projectType: 'Project Type',
    projectTypeGroup: 'Project Type Group',
    project: 'Project',
    portfolio: 'Portfolio',
    resourceStatuses: 'Resource Status',
    resourceLocations: 'Resource Location',
    resourceWorkLocationGroup: 'Resource Location Group',
    projectStatuses: 'Project Status',
    userStatuses: 'User Status',
    userRoles: 'Role',
    show_actuals: 'Show Actuals',
  };

  // Get display value for report filters
  const getReportDisplayValue = (key: string, value: any): string | string[] => {
    if (!value) return '';

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return '';
      
      const displayValues = value.map((val: string) => {
        if (val === 'all') return '';
        if (val === '_BLANK_') return '(Blanks)';
        
        // Map IDs to labels using option arrays
        switch (key) {
          case 'projectManager':
            return projectManagerOptions.find(opt => opt.value === val)?.label || val;
          case 'allocationManager':
            return allocationManagerOptions.find(opt => opt.value === val)?.label || val;
          case 'team':
            return teamOptions.find(opt => opt.value === val)?.label || val;
          case 'organization':
            return organizationOptions.find(opt => opt.value === val)?.label || val;
          case 'resourceType':
            return resourceTypeOptions.find(opt => opt.value === val)?.label || val;
          case 'resource':
            return resourceOptions.find(opt => opt.value === val)?.label || val;
          case 'projectType':
            return projectTypeOptions.find(opt => opt.value === val)?.label || val;
          case 'projectTypeGroup':
            return projectTypeGroupOptions.find(opt => opt.value === val)?.label || val;
          case 'project':
            return projectOptions.find(opt => opt.value === val)?.label || val;
          case 'portfolio':
            return portfolioOptions.find(opt => opt.value === val)?.label || val;
          case 'resourceStatuses':
            return resourceStatusOptions.find(opt => opt.value === val)?.label || val;
          case 'resourceLocations':
            return resourceLocationOptions.find(opt => opt.value === val)?.label || val;
          case 'resourceWorkLocationGroup':
            return resourceWorkLocationGroupOptions.find(opt => opt.value === val)?.label || val;
          case 'projectStatuses':
            return projectStatusOptions.find(opt => opt.value === val)?.label || val;
          case 'userStatuses':
            return userStatusOptions.find(opt => opt.value === val)?.label || val;
          case 'userRoles':
            return userRoleOptions.find(opt => opt.value === val)?.label || val;
          default:
            return val;
        }
      }).filter((val: string) => val !== '');
      
      return displayValues;
    }

    // Handle boolean values
    if (key === 'show_actuals') {
      return value ? 'Yes' : '';
    }

    // Handle single values
    if (key === 'period') {
      const periodOptions = [
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'last_quarter', label: 'Last Quarter' },
        { value: 'this_year', label: 'This Year' },
        { value: 'last_year', label: 'Last Year' },
        { value: 'custom', label: formatDateRange(filters.customDateRange) },
      ];
      return periodOptions.find(opt => opt.value === value)?.label || value;
    }

    return value;
  };

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePeriodChange = (value: string, event?: any) => {
    if (value === 'custom') {
      setTempDateRange(filters.customDateRange || [null, null]);
      // Open the submenu for custom dates
      if (event && event.currentTarget) {
        setCustomDateSubmenuAnchor(event.currentTarget);
      }
    } else {
      handleFilterChange('period', value);
      // Clear custom date range when selecting other periods
      if (filters.customDateRange) {
        onFiltersChange({ ...filters, period: value, customDateRange: undefined });
      }
      setCustomDateSubmenuAnchor(null);
    }
  };

  const formatDateRange = (dateRange?: DateRange<Dayjs>): string => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return '';
    const start = dateRange[0];
    const end = dateRange[1];
    return `${start.format('MMM DD, YYYY')} - ${end.format('MMM DD, YYYY')}`;
  };

  const handleChipDelete = (key: string) => {
    if (key === 'reportType') {
      handleFilterChange('reportType', 'resourceProjectPeriod');
    } else if (key === 'period') {
      handleFilterChange('period', 'last_week');
    } else if (key === 'show_actuals') {
      handleFilterChange('show_actuals', false);
    } else {
      // Reset to empty array for all array-based filters
      handleFilterChange(key as keyof ReportFilters, []);
    }
  };

  const getFiltersForChips = (): Record<string, any> => {
    const filtersToDisplay: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      // Skip default/empty values for report mode
      if (!value || 
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value === 'resourceProjectPeriod' && key === 'reportType') || key === 'summaryType' ||
          (key === 'period' && (filters.reportType === 'resourceOnly' || filters.reportType === 'projectsOnly'|| filters.reportType === 'userActivity'))) {
        return;
      }
      
      filtersToDisplay[key] = value;
    });
    
    return filtersToDisplay;
  };

  return (
    <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E5E7EB' }}>
      <Accordion
      expanded={expanded}
      onChange={onToggle}
      disableGutters
      elevation={0}
      sx={{
        '&:before': { display: 'none' },
        '& .MuiAccordionSummary-root': {
        minHeight: 48,
        '&.Mui-expanded': {
          minHeight: 48,
        },
        },
      }}
      >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
        px: 3,
        '& .MuiAccordionSummary-content': {
          my: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
          Filters
        </Typography>
        {!expanded && (
          <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', overflow: 'auto' }}>
            <FilterChips
              filters={getFiltersForChips()}
              filterLabels={reportFilterLabels}
              onFilterRemove={handleChipDelete}
              onClearAll={onResetFilters}
              getDisplayValue={getReportDisplayValue}
              filterType="report"
              showClearButton={permissions?.['Reports']?.r}
            />
          </Box>
        )}
       
        </Box>
        <Typography
        sx={{
          fontSize: '13px',
          color: '#3B82F6',
          fontWeight: 500,
          mr: 2,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        >
        {expanded ? 'Hide' : 'Show'}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 3, pb: 3, pt: 1 }}>

        {/* Period Dropdown - Only show if period is required for this report/summary type */}
        {checkPeriodRequired() && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          sx={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#1C2D5F',
          }}
        >
          Period
        </Typography>
        <Box sx={{ minWidth: 250, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Select
            id="period-select"
            value={filters.period}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                // Open the submenu for custom dates
                const menuElement = document.getElementById('period-select');
                if (menuElement) {
                  handlePeriodChange(value, { currentTarget: menuElement });
                }
              } else {
                handlePeriodChange(value);
              }
            }}
            size="small"
            displayEmpty
            sx={{
              minWidth: 200,
              pr: 1,
              height: 36,
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E5E7EB',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D1D5DB',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#152E75',
                borderWidth: '1px',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  mt: 0.1,
                  '& .MuiMenuItem-root': {
                    fontSize: '13px',
                    fontWeight: 500,
                    py: 1,
                    px: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      backgroundColor: '#F3F4F6',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#EEF2FF',
                      color: '#152E75',
                      '&:hover': {
                        backgroundColor: '#E0E7FF',
                      },
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="this_week">This Week</MenuItem>
            <MenuItem value="last_week">Last Week</MenuItem>
            <MenuItem value="this_month">This Month</MenuItem>
            <MenuItem value="last_month">Last Month</MenuItem>
            <MenuItem value="this_quarter">This Quarter</MenuItem>
            <MenuItem value="last_quarter">Last Quarter</MenuItem>
            <MenuItem value="this_year">This Year</MenuItem>
            <MenuItem value="last_year">Last Year</MenuItem>
            <MenuItem 
              value="custom"
              sx={{
                '&::after': {
                  content: '"→"',
                  marginLeft: 'auto',
                  fontSize: '12px',
                  color: '#64748B',
                },
              }}
            >
              <span>Custom</span>
            </MenuItem>
          </Select>

          {filters.period === 'custom' && formatDateRange(filters.customDateRange) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Left Arrow - Previous Week */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  const currentRange = filters.customDateRange;
                  if (currentRange && currentRange[0] && currentRange[1]) {
                    const newStart = dayjs(currentRange[0]).subtract(7, 'day');
                    const newEnd = dayjs(currentRange[1]).subtract(7, 'day');
                    onFiltersChange({
                      ...filters,
                      period: 'custom',
                      customDateRange: [newStart, newEnd],
                    });
                  }
                }}
                size="small"
                sx={{
                color: '#5D6979',
                '&:hover': {
                  backgroundColor: 'rgba(52, 70, 101, 0.04)',
                },
              }}
              >
                <ChevronLeftIcon />
              </IconButton>

              {/* Date Range Display */}
              <Box
                onClick={(e) => {
                  setTempDateRange(filters.customDateRange || [null, null]);
                  setCustomDateSubmenuAnchor(e.currentTarget);
                }}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRadius: '5px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  px: 1.5,
                  py: 1.25,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#F9FAFB',
                    borderColor: '#D1D5DB',
                  },
                }}
              >
                <CalendarMonthIcon sx={{ fontSize: 18, mr: 1, color: '#5D6979' }} /> {' '}
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatDateRange(filters.customDateRange)}
                </Typography>
              </Box>

              {/* Right Arrow - Next Week */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  const currentRange = filters.customDateRange;
                  if (currentRange && currentRange[0] && currentRange[1]) {
                    const newStart = dayjs(currentRange[0]).add(7, 'day');
                    const newEnd = dayjs(currentRange[1]).add(7, 'day');
                    onFiltersChange({
                      ...filters,
                      period: 'custom',
                      customDateRange: [newStart, newEnd],
                    });
                  }
                }}
                size="small"
                sx={{
                color: '#5D6979',
                '&:hover': {
                  backgroundColor: 'rgba(52, 70, 101, 0.04)',
                },
              }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          )}

          {/* Custom Date Range Submenu */}
          <Menu
            id="custom-date-menu"
            anchorEl={customDateSubmenuAnchor}
            open={Boolean(customDateSubmenuAnchor)}
            onClose={() => setCustomDateSubmenuAnchor(null)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            PaperProps={{
              sx: {
                width: 'auto',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <Box sx={{ px:1,minWidth: 'auto' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateRangeCalendar
                  value={tempDateRange}
                  displayWeekNumber={true}
                  onChange={(newValue) => {
                    setTempDateRange(newValue);
                    // Auto-close and apply when both dates are selected
                    if (newValue[0] && newValue[1]) {
                      onFiltersChange({
                        ...filters,
                        period: 'custom',
                        customDateRange: newValue,
                      });
                      setCustomDateSubmenuAnchor(null);
                    }
                  }}
                  calendars={2}
                  sx={{
                    '& .MuiPickersDay-root': {
                      fontSize: '13px',
                      fontWeight: 400,
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#152E75 !important',
                      color: '#fff !important',
                      fontWeight: 600,
                    },
                    '& .MuiDateRangePickerDay-rangeIntervalDayHighlight': {
                      backgroundColor: '#EEF2FF',
                    },
                    '& .MuiPickersCalendarHeader-label': {
                      fontSize: '13px',
                      fontWeight: 600,
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748B',
                    },
                    '& .MuiPickersSlideTransition-root-MuiDayCalendar-slideTransition': {
                      minHeight: '210px',
                      height: '210px',
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Menu>
        </Box>
        </Box>
        )}

        {/* Filter Grid */}
        <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(5, 1fr)',
          lg: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 2,
        }}
        >
        {checkFilterEnabled( 'projectManager') && (
        <FilterSection
          disabled={!permissions?.['Resource']?.r}
          title="Project Manager"
          name="projectManager"
          options={projectManagerOptions}
          selected={filters.projectManager}
          onChange={(value) => handleFilterChange('projectManager', value)}
          formikProps={formikProps}
        />
        )}
        {checkFilterEnabled( 'allocationManager') && (
        <FilterSection
          disabled={!permissions?.['Resource']?.r}
          title="Allocation Manager"
          name="allocationManager"
          options={allocationManagerOptions}
          selected={filters.allocationManager}
          onChange={(value) => handleFilterChange('allocationManager', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'team') && (
        <FilterSection
          disabled={!permissions?.['Team']?.r}
          title="Team"
          name="team"
          options={teamOptions}
          selected={filters.team}
          onChange={(value) => handleFilterChange('team', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'organization') && (
        <FilterSection
          disabled={!permissions?.['Organization']?.r}
          title="Organization"
          name="organization"
          options={organizationOptions}
          selected={filters.organization}
          onChange={(value) => handleFilterChange('organization', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'resourceType') && (
        <FilterSection
          disabled={!permissions?.['ResourceType']?.r}
          title="Resource Type"
          name="resourceType"
          options={resourceTypeOptions}
          selected={filters.resourceType}
          onChange={(value) => handleFilterChange('resourceType', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'resource') && (
        <FilterSection
          disabled={!permissions?.['Resource']?.r}
          title="Resource"
          name="resource"
          options={resourceOptions}
          selected={filters.resource}
          onChange={(value) => handleFilterChange('resource', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'projectType') && (
        <FilterSection
          disabled={!permissions?.['ProjectType']?.r}
          title="Project Type"
          name="projectType"
          options={projectTypeOptions}
          selected={filters.projectType}
          onChange={(value) => handleFilterChange('projectType', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'projectTypeGroup') && (
        <FilterSection
          disabled={!permissions?.['ProjectTypeGroup']?.r}
          title="Project Type Group"
          name="projectTypeGroup"
          options={projectTypeGroupOptions}
          selected={filters.projectTypeGroup}
          onChange={(value) => handleFilterChange('projectTypeGroup', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'project') && (
        <FilterSection
          disabled={!permissions?.['Project']?.r}
          title="Project"
          name="project"
          options={projectOptions}
          selected={filters.project}
          onChange={(value) => handleFilterChange('project', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'portfolio') && (
        <FilterSection
          disabled={!permissions?.['Portfolio']?.r}
          title="Portfolio"
          name="portfolio"
          options={portfolioOptions}
          selected={filters.portfolio}
          onChange={(value) => handleFilterChange('portfolio', value)}
          formikProps={formikProps}
        />
        )}
        {checkFilterEnabled( 'resourceStatuses') && (
        <FilterSection
          disabled={!permissions?.['Resource']?.r}
          title="Resource Status"
          name="resourceStatuses"
          options={resourceStatusOptions}
          selected={filters.resourceStatuses}
          onChange={(value) => handleFilterChange('resourceStatuses', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'resourceLocations') && (
        <FilterSection
          disabled={!permissions?.['WorkLocation']?.r}
          title="Resource Location"
          name="resourceLocations"
          options={resourceLocationOptions}
          selected={filters.resourceLocations}
          onChange={(value) => handleFilterChange('resourceLocations', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'resourceWorkLocationGroup') && (
        <FilterSection
          disabled={!permissions?.['WorkLocationGroup']?.r}
          title="Resource Location Group"
          name="resourceWorkLocationGroup"
          options={resourceWorkLocationGroupOptions}
          selected={filters.resourceWorkLocationGroup}
          onChange={(value) => handleFilterChange('resourceWorkLocationGroup', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'projectStatuses') && (
        <FilterSection
          disabled={!permissions?.['Project']?.r}
          title="Project Status"
          name="projectStatuses"
          options={projectStatusOptions}
          selected={filters.projectStatuses}
          onChange={(value) => handleFilterChange('projectStatuses', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'userStatuses') && (
        <FilterSection
          disabled={false}
          title="User Status"
          name="userStatuses"
          options={userStatusOptions}
          selected={filters.userStatuses}
          onChange={(value) => handleFilterChange('userStatuses', value)}
          formikProps={formikProps}
        />
        )}

        {checkFilterEnabled( 'userRoles') && (
        <FilterSection
          disabled={false}
          title="Roles"
          name="userRoles"
          options={userRoleOptions}
          selected={filters.userRoles}
          onChange={(value) => handleFilterChange('userRoles', value)}
          formikProps={formikProps}
        />
        )}
        </Box>

        {/* Show Actuals Checkbox - Only for Custom Tab and not for Allocation Capacity */}
        {mode === 'custom' && customReportType !== 'allocationCapacity' && (
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.show_actuals || false}
                  onChange={(e) => {
                    onFiltersChange({
                      ...filters,
                      show_actuals: e.target.checked,
                    });
                  }}
                  sx={{
                    color: '#152E75',
                    '&.Mui-checked': {
                      color: '#152E75',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1C2D5F',
                  }}
                >
                  Show Actuals
                </Typography>
              }
            />
          </Box>
        )}

        {/* Reset Filters Button */}
        {permissions?.['Reports']?.r && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button
          variant="text"
          onClick={onResetFilters}
          sx={{
          textTransform: 'none',
          fontSize: '13px',
          fontWeight: 600,
          color: '#0A0A0A',
          border: '1px solid #0000001A',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#F3F4F6',
          },
          }}
        >
          Reset Filters
        </Button>
        </Box>
        )}
      </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default withRBAC(ReportBuilderFilters, [
  'Resource',
  'ResourceType',
  'WorkLocation',
  'WorkLocationGroup',
  'Project',
  'ProjectType',
  'ProjectTypeGroup',
  'Portfolio',
  'Team',
  'Organization',
  'Reports',
]);