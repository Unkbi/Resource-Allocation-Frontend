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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
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
  reportType: string;
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
}

interface FilterSectionProps {
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
  title,
  name,
  options,
  selected,
  onChange,
  formikProps,
  placeholder = 'All',
  multiple = true,
}: FilterSectionProps) => {
  // Add 'All' option to the beginning of options
  const optionsWithAll = [{ label: 'All', value: 'all' }, ...options];

  return (
    <Box>
      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#6B7280',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <StyledAutocomplete
        name={name}
        label={placeholder}
        options={optionsWithAll}
        value={selected || (multiple ? ['all'] : 'all')}
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
}

export default function ReportBuilderFilters({
  expanded,
  onToggle,
  filters,
  onFiltersChange,
  onResetFilters,
}: ReportBuilderFiltersProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Custom date range picker state
  const [customDateSubmenuAnchor, setCustomDateSubmenuAnchor] = useState<null | HTMLElement>(null);
  const [tempDateRange, setTempDateRange] = useState<DateRange<Dayjs>>(filters.customDateRange || [null, null]);
  
  // Redux selectors
  const { projectTypeGroups, projectTypes } = useSelector((state: RootState) => state.allSettings);
  const { portfolios } = useSelector((state: RootState) => state.portfolios);
  const { teams } = useSelector((state: RootState) => state.teams);
  const { resources } = useSelector((state: RootState) => state.resources);
  const { organisations } = useSelector((state: RootState) => state.organisations);
  const { projects } = useSelector((state: RootState) => state.projects);

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
  }, [dispatch, projectTypeGroups.length, teams?.length, projects?.length, resources?.length, portfolios?.length, organisations?.length, projectTypes.length]);

  const reportTypes = [
    { label: 'Resource, Project, Period & Cost', value: 'resource_project_period_cost', group: 'Allocation & Cost Analysis' },
    { label: 'Allocation & Actuals', value: 'allocation_actuals', group: 'Allocation & Cost Analysis' },
    { label: 'Resource & Period', value: 'resource_period', group: 'Two Dimension Views' },
    { label: 'Project & Period', value: 'project_period', group: 'Two Dimension Views' },
    { label: 'Resource Only', value: 'resource_only', group: 'Single Dimension Views' },
    { label: 'Project Only', value: 'project_only', group: 'Single Dimension Views' },
  ];

  // Prepare options from Redux data
  const projectTypeGroupOptions =
    projectTypeGroups?.map((projectTypeGroup: any) => ({
      value: projectTypeGroup.Id,
      label: projectTypeGroup.Name ?? '',
    })) || [];

  const projectTypeOptions =
    projectTypes?.map((projectType: any) => ({
      value: projectType.Id,
      label: projectType.Name ?? '',
    })) || [];

  const teamOptions =
    teams?.map((team: any) => ({
      value: team.Id,
      label: team.Name ?? '',
    })) || [];

  const resourceOptions =
    resources?.map((resource: any) => ({
      value: resource.Id,
      label: resource.FullName ?? '',
    })) || [];

  const portfolioOptions =
    portfolios?.map((portfolio: any) => ({
      value: portfolio.Id,
      label: portfolio.Name ?? '',
    })) || [];

  const organizationOptions =
    organisations?.map((organisation: any) => ({
      value: organisation.Id,
      label: organisation.Name ?? '',
    })) || [];

  const projectOptions =
    projects?.map((project: any) => ({
      value: project.Id,
      label: project.Name ?? '',
    })) || [];

  // Get unique allocation managers from teams
  const allocationManagers = teams?.map((team: any) => {
    const manager = team && getAllocationManagerFromPath(team.AllocationManager, resources);
    return {
      value: manager ? manager.Id : '',
      label: manager ? manager.FullName : '',
    };
  }) || [];

  const allocationManagerOptions = Array.from(
    new Map(
      allocationManagers
        .filter(option => option.value !== '')
        .map(option => [option.value, option])
    ).values()
  );

  // Get unique project managers from projects
  const projectManagers = projects?.map((project: any) => {
    const manager = project && getResourceFromUid(project.ProjectManager, resources);
    return {
      value: manager ? manager.Id : '',
      label: manager ? manager.FullName : '',
    };
  }) || [];

  const projectManagerOptions = Array.from(
    new Map(
      projectManagers
        .filter(option => option.value !== '')
        .map(option => [option.value, option])
    ).values()
  );

  // Resource type options (FTE, Contractor, etc.)
  const resourceTypeOptions = [
    { value: 'fte', label: 'FTE' },
    { value: 'contractor', label: 'Contractor' },
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
  };

  // Get display value for report filters
  const getReportDisplayValue = (key: string, value: any): string | string[] => {
    if (!value) return '';

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0 || (value.length === 1 && value[0] === 'all')) return '';
      
      const displayValues = value.map((val: string) => {
        if (val === 'all') return '';
        
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
          default:
            return val;
        }
      }).filter((val: string) => val !== '');
      
      return displayValues;
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

  const getQuickSelectDates = (option: string): DateRange<Dayjs> => {
    const today = dayjs();

    switch (option) {
      case 'this_week':
        return [today.startOf('week'), today.endOf('week')];
      case 'last_week':
        const lastWeekStart = today.subtract(1, 'week').startOf('week');
        return [lastWeekStart, lastWeekStart.endOf('week')];
      case 'this_month':
        return [today.startOf('month'), today.endOf('month')];
      case 'last_month':
        const lastMonthStart = today.subtract(1, 'month').startOf('month');
        return [lastMonthStart, lastMonthStart.endOf('month')];
      case 'this_quarter':
        return [today.startOf('quarter'), today.endOf('quarter')];
      case 'last_quarter':
        const lastQuarterStart = today.subtract(1, 'quarter').startOf('quarter');
        return [lastQuarterStart, lastQuarterStart.endOf('quarter')];
      case 'this_year':
        return [today.startOf('year'), today.endOf('year')];
      case 'last_year':
        const lastYearStart = today.subtract(1, 'year').startOf('year');
        return [lastYearStart, lastYearStart.endOf('year')];
      default:
        return [null, null];
    }
  };

  const handleChipDelete = (key: string) => {
    if (key === 'reportType') {
      handleFilterChange('reportType', 'allocation_actuals');
    } else if (key === 'period') {
      handleFilterChange('period', 'this_week');
    } else {
      // Reset to ['all'] for all array-based filters
      handleFilterChange(key as keyof ReportFilters, ['all']);
    }
  };

  const getFiltersForChips = (): Record<string, any> => {
    const filtersToDisplay: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      // Skip default/empty values for report mode
      if (!value || 
          (typeof value === 'string' && value === 'all') ||
          (typeof value === 'string' && value === 'this_week' && key === 'period') ||
          (typeof value === 'string' && value === 'allocation_actuals' && key === 'reportType') ||
          (Array.isArray(value) && value.length === 0) ||
          (Array.isArray(value) && value.length === 1 && value[0] === 'all')) {
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
              showClearButton={false}
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

        {/* Period Dropdown */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          sx={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#6B7280',
          }}
        >
          Period
        </Typography>
        <Box sx={{ minWidth: 250 }}>
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
        <FilterSection
          title="Project Manager"
          name="projectManager"
          options={projectManagerOptions}
          selected={filters.projectManager}
          onChange={(value) => handleFilterChange('projectManager', value)}
          formikProps={formikProps}
        />
        <FilterSection
          title="Allocation Manager"
          name="allocationManager"
          options={allocationManagerOptions}
          selected={filters.allocationManager}
          onChange={(value) => handleFilterChange('allocationManager', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Project"
          name="project"
          options={projectOptions}
          selected={filters.project}
          onChange={(value) => handleFilterChange('project', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Team"
          name="team"
          options={teamOptions}
          selected={filters.team}
          onChange={(value) => handleFilterChange('team', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Organization"
          name="organization"
          options={organizationOptions}
          selected={filters.organization}
          onChange={(value) => handleFilterChange('organization', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Resource Type"
          name="resourceType"
          options={resourceTypeOptions}
          selected={filters.resourceType}
          onChange={(value) => handleFilterChange('resourceType', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Resource"
          name="resource"
          options={resourceOptions}
          selected={filters.resource}
          onChange={(value) => handleFilterChange('resource', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Project Type"
          name="projectType"
          options={projectTypeOptions}
          selected={filters.projectType}
          onChange={(value) => handleFilterChange('projectType', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Project Type Group"
          name="projectTypeGroup"
          options={projectTypeGroupOptions}
          selected={filters.projectTypeGroup}
          onChange={(value) => handleFilterChange('projectTypeGroup', value)}
          formikProps={formikProps}
        />

        <FilterSection
          title="Portfolio"
          name="portfolio"
          options={portfolioOptions}
          selected={filters.portfolio}
          onChange={(value) => handleFilterChange('portfolio', value)}
          formikProps={formikProps}
        />
        </Box>

        {/* Reset Filters Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
      </AccordionDetails>
      </Accordion>
    </Box>
  );
}
