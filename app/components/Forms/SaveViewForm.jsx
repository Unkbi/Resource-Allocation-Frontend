'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  IconButton,
  TextField,
  styled,
  Autocomplete,
} from '@mui/material';
import { X, Plus } from 'lucide-react';
import StyledLabel from '../Label/StyledLabel';
import CustomSelect from '../Select/CustomSelect';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import { StyledInput } from '../Input/StyledInput';
import MultiSelectWithChips from '../Select/MultiSelectWithChipSmaller';
import { getTodaysDateDDMMMYYYY } from '@/app/utils/dateUtils';
import { addWeeks, format, startOfWeek, subWeeks } from 'date-fns';
import {
  DATE_FORMAT,
  DEFAULT_PROJECT_WEEK_MINUS,
  DEFAULT_PROJECT_WEEK_PLUS,
  PORTFOLIO_DISPLAY_NAME,
} from '@/app/constants/constants';
import {
  calculateWeekRanges,
  getResourceFromEmail,
  getUpdatedFiltersOnMyProjectsAllProjects,
  getUpdatedFiltersOnMyTeamsAllTeams,
  isMyProjectsValid,
  isMyTeamsValid,
} from '@/app/utils/common';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import {
  DEFAULT_VISIBLE_PORTFOLIO_COLUMNS,
  DEFAULT_VISIBLE_PROJECTS_COLUMNS,
  DEFAULT_VISIBLE_TEAMS_COLUMNS,
} from '@/app/redux/reducers/allocationViewReducer';
import { getUserAttributes } from '@/app/utils/authUtils';

const getColumnLabel = (column, groupBy = '') => {
  const columnLabels = {
    __row_group_by_columns_group_teams__: 'Team Name',
    __row_group_by_columns_group_organisationName__: 'Organization Name',
    __row_group_by_columns_group_resource__: 'Resource',
    __row_group_by_columns_group__:
      groupBy === 'Resources' ? 'Resource Name' : 'Project Name',
    __row_group_by_columns_group_project__:
      groupBy === 'Project' ? 'Project Name' : 'Project',
    __row_group_by_columns_group_portfolioName__: `${PORTFOLIO_DISPLAY_NAME} Name`,
    portfolioName: PORTFOLIO_DISPLAY_NAME,
    totalEffort: 'Total Effort',
    organisationName: 'Organization Name',
    resource: 'Resource',
    project: 'Project',
    teams: 'Team',
    teamStatus: 'Team Status',
    teamAllocationManager: 'Allocation Manager',
    organisationStatus: 'Organization Status',
    resourceType: 'Resource Type',
    projectSponsor: 'Project Sponsor',
    projectManager: 'Project Manager',
    projectStatus: 'Project Status',
    projectLocation: 'Project Location',
    projectType: 'Project Type',
    projectOvertimeAllowed: 'Overtime',
    projectCost: 'Project Budget',
    projectCurrency: 'Project Currency',
    projectStartDate: 'Project Start Date',
    projectEndDate: 'Project End Date',
    Email: 'Email',
    PhoneNumber: 'Phone Number',
    Department: 'Department',
    WorkLocation: 'Resource Work Location',
    LocationCategory: 'Resource Location Category',
    Type: 'Resource Type',
    Status: 'Resource Status',
    HRLevel: 'HR Level',
    Role: 'Resource Role',
    StartDate: 'Resource Start Date',
    EndDate: 'Resource End Date',
    AverageWeeklyHours: 'Average Weekly Hours',
    ContractorHourlyRate: 'Contractor Hourly Rate',
    ContractorHourlyRateCurrency: 'Contractor Hourly Rate Currency',
    email: 'Email',
    phoneNumber: 'Phone Number',
    department: 'department',
    hrLevel: 'HR Level',
    role: 'Resource Role',
    workLocation: 'Resource Work Location',
    resourceStartDate: 'Resource Start Date',
    resourceEndDate: 'Resource End Date',
    resourceLocationCategory: 'Resource Location Category',
    averageWeeklyHours: 'Average Weekly Hours',
    contractorHourlyRate: 'Contractor Hourly Rate',
    contractorHourlyRateCurrency: 'Contractor Hourly Rate Currency',
    projectOvertimeAllowed: 'Allow Overtime',
    projectCost: 'Project Budget',
    projectCurrency: 'Project Currency',
    Description: 'Project Description',
    projectDescription: 'Project Description',
    projectLocation: 'Project Location',
    ProjectManager: 'Project Manager',
    ProjectSponsor: 'Project Sponsor',
    ProjectEndDate: 'Project End Date',
    ProjectStartDate: 'Project Start Date',
    Status: 'Project Status',
    Type: 'Project Type',
  };

  return columnLabels[column];
};

const getDateFromWeekMath = (date, operation, weeks) => {
  let newDate = date || new Date();

  switch (operation) {
    case 'ADD':
      newDate = addWeeks(date, weeks);
      break;
    case 'SUBTRACT':
      newDate = subWeeks(date, weeks);
      break;
    default:
      newDate = date;
  }

  // Get the Monday of the new week
  const mondayOfNewWeek = startOfWeek(newDate, { weekStartsOn: 1 });

  // Return the Monday in 'dd MMM yy' format
  return format(mondayOfNewWeek, 'dd MMM yy');
};

const SaveViewForm = ({ formikProps, setFormValue }) => {
  const { values, handleChange, handleBlur, setFieldValue, errors, touched } =
    formikProps;
  const { columns, currentView } = useSelector(state => state.allocationView);
  const { user } = useSelector(state => state.user);
  const { email = '' } = getUserAttributes(user, []) || {};
  const { resources } = useSelector(state => state.resources);

  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  const commonSlotProps = {
    popper: {
      modifiers: [
        {
          name: 'preventOverflow',
          options: {
            boundary: 'window',
          },
        },
      ],
    },
    paper: {
      sx: {
        fontSize: '12px',
      },
    },
  };

  const columnOptions =
    values?.groupBy === 'Teams'
      ? columns.team.map(column => ({
          id: column,
          value: column,
          label: getColumnLabel(column),
        }))
      : values?.groupBy === 'Organisations'
        ? columns.organisationName.map(column => ({
            id: column,
            value: column,
            label: getColumnLabel(column),
          }))
        : values?.groupBy === 'Resources'
          ? columns.resource.map(column => ({
              id: column,
              value: column,
              label: getColumnLabel(column, values?.groupBy),
            }))
          : values?.groupBy === 'Portfolio'
            ? columns.portfolioName.map(column => ({
                id: column,
                value: column,
                label: getColumnLabel(column),
              }))
            : values?.groupBy === 'Project'
              ? columns.project.map(column => ({
                  id: column,
                  value: column,
                  label: getColumnLabel(column, values?.groupBy),
                }))
              : columns['']?.map(column => ({
                  id: column,
                  value: column,
                  label: getColumnLabel(column),
                }));

  // All possible viewBys
  const viewByOptions = [
    {
      value: 'Teams',
      label: 'Teams*',
      extraInfo: 'Group by Resources, then by Teams',
    },
    {
      value: 'Organisations',
      label: 'Organizations*',
      extraInfo: 'Group by Resources, then by Organizations',
    },
    {
      value: 'Resources',
      label: 'Resources*',
      extraInfo: 'Group by Resources',
    },
    {
      value: 'Project',
      label: 'Projects*',
      extraInfo: 'Group by Projects',
    },
    {
      value: 'Portfolio',
      label: 'Portfolios*',
      extraInfo: 'Group by Projects, then by Portfolios',
    },
    {
      value: 'Flat',
      label: 'Flat*',
      extraInfo: 'No Grouping',
    },
  ];

  // All possible opetrators. Static.
  const operatorOptions = [
    { value: 'contains', label: 'contains' },
    { value: 'doesNotContain', label: 'Does Not Contain' },
    { value: 'equals', label: 'Equals' },
    { value: 'doesNotEqual', label: 'Does Not Equals' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'isEmpty', label: 'Is Empty' },
    { value: 'isNotEmpty', label: 'Is Not Empty' },
    { value: 'isAnyOf', label: 'Is Any Of' },
  ];

  const formatedColumnValues =
    values?.showColumns?.map(column => ({
      id: column,
      label: getColumnLabel(column),
      value: column,
    })) || [];

  const addFilter = () => {
    const newFilters = [
      ...values.filters,
      {
        field: '__row_group_by_columns_group_teams__',
        operator: 'contains',
        value: '',
      },
    ];
    setFieldValue('filters', newFilters);
  };

  const removeAllFilters = () => {
    setFieldValue('filters', []);
  };

  // Error display helper
  const showError = fieldName => {
    return touched[fieldName] && errors[fieldName] ? (
      <Typography
        color="error"
        sx={{
          fontSize: '12px',
          mt: 0.5,
          fontFamily: 'Open Sans',
        }}
      >
        {errors[fieldName]}
      </Typography>
    ) : null;
  };

  const handleColumnUpdate = value => {
    setFieldValue('showColumns', value);
  };

  const handleGroupByChange = newValue => {
    const { value } = newValue;
    setFieldValue('groupBy', value);

    setFieldValue('showBy', value === 'Teams' ? 'AllTeams' : 'AllProject');
    setFieldValue(
      'showColumns',
      value === 'Teams'
        ? DEFAULT_VISIBLE_TEAMS_COLUMNS
        : value === 'Portfolio'
          ? DEFAULT_VISIBLE_PORTFOLIO_COLUMNS
          : DEFAULT_VISIBLE_PROJECTS_COLUMNS
    );
    setFieldValue('filters', []);
  };

  const handleAddWeek = () => {
    const totalWeeks =
      values.dynamicDateRangeSubtract + values.dynamicDateRangeAdd + 1;
    if (totalWeeks > 52) {
      setFieldValue(
        'dynamicRangeError',
        'Date range cannot exceed 1 year (52 weeks).'
      );
      setFieldValue('dynamicDateRangeAdd', values.dynamicDateRangeAdd + 1);
      setFieldValue(
        'dynamicDateRangeSubtract',
        values.dynamicDateRangeSubtract - 1
      );
    } else {
      setFieldValue('dynamicRangeError', '');
      setFieldValue('dynamicDateRangeAdd', values.dynamicDateRangeAdd + 1);
    }
  };

  const handleSubtractWeek = () => {
    const totalWeeks =
      values.dynamicDateRangeSubtract + values.dynamicDateRangeAdd + 1;
    if (totalWeeks > 52) {
      setFieldValue(
        'dynamicRangeError',
        'Date range cannot exceed 1 year (52 weeks).'
      );
      setFieldValue(
        'dynamicDateRangeSubtract',
        values.dynamicDateRangeSubtract + 1
      );
      setFieldValue('dynamicDateRangeAdd', values.dynamicDateRangeAdd - 1);
    } else {
      setFieldValue(
        'dynamicDateRangeSubtract',
        values.dynamicDateRangeSubtract + 1
      );
      setFieldValue('dynamicRangeError', '');
    }
  };
  useEffect(() => {
    if (
      values.dateRangeType === 'dynamic' &&
      values?.dynamicDateRangeSubtract !== null &&
      values?.dynamicDateRangeSubtract !== undefined
    ) {
      const currentStartDate = getDateFromWeekMath(
        new Date(),
        'SUBTRACT',
        values?.dynamicDateRangeSubtract
      );
      setFieldValue('startDate', format(currentStartDate, DATE_FORMAT));
    }
    if (
      values.dateRangeType === 'dynamic' &&
      values?.dynamicDateRangeAdd !== null &&
      values?.dynamicDateRangeAdd !== undefined
    ) {
      const currentEndDate = getDateFromWeekMath(
        new Date(),
        'ADD',
        values?.dynamicDateRangeAdd
      );
      setFieldValue('endDate', format(currentEndDate, DATE_FORMAT));
    }
  }, [values.dynamicDateRangeAdd, values.dynamicDateRangeSubtract]);

  useEffect(() => {
    if (values.dynamicRangeError) {
      const timer = setTimeout(() => {
        setFieldValue('dynamicRangeError', '');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [values.dynamicRangeError]);

  useEffect(() => {
    const initialData = {
      groupBy: currentView?.GroupBy || 'Teams',
      showBy:
        currentView?.GroupBy === 'Teams' ||
        currentView?.GroupBy === 'Organisations' ||
        currentView?.GroupBy === 'Resources' ||
        currentView?.GroupBy === 'Flat'
          ? currentView?.MyTeam
            ? 'MyTeams'
            : 'AllTeams'
          : currentView?.MyProjects
            ? 'MyProject'
            : 'AllProject',
      dateRangeType: currentView?.isDynamicRange ? 'dynamic' : 'fixed',
      dynamicDateRangeAdd: currentView?.WeekPlus || DEFAULT_PROJECT_WEEK_PLUS,
      dynamicDateRangeSubtract:
        currentView?.WeekMinus || DEFAULT_PROJECT_WEEK_MINUS,
      startDate: currentView.StartDate !== '' ? currentView.StartDate : null,
      endDate: currentView.EndDate !== '' ? currentView.EndDate : null,
      showColumns: currentView?.ColumnsVisible || [],
      filters:
        currentView?.Filters?.map(filter => {
          return {
            field: filter.field,
            operator: filter.operator,
            value: filter.value,
          };
        }) || [],
      calendarBy: 'week',
    };
    setFormValue(initialData);
  }, []);

  useEffect(() => {
    if (values?.showBy && email) {
      const allocationManagerName = getResourceFromEmail(
        email,
        resources?.result || []
      )?.FullName;

      if (values.showBy === 'MyTeams') {
        const updatedFilters = getUpdatedFiltersOnMyTeamsAllTeams(
          allocationManagerName,
          values.filters,
          true
        );
        setFieldValue('filters', updatedFilters);
        return;
      }
      if (values.showBy === 'AllTeams') {
        const updatedFilters = getUpdatedFiltersOnMyTeamsAllTeams(
          allocationManagerName,
          values.filters,
          false
        );
        setFieldValue('filters', updatedFilters);
        return;
      }

      const projectManager = getResourceFromEmail(
        email,
        resources?.result || []
      );

      const projectManagerName = projectManager
        ? `${projectManager?.FullName}`.trim()
        : '';

      if (values.showBy === 'MyProject') {
        const updatedFilters = getUpdatedFiltersOnMyProjectsAllProjects(
          projectManagerName,
          values.filters,
          true
        );
        setFieldValue('filters', updatedFilters);
        return;
      }
      if (values.showBy === 'AllProject') {
        const updatedFilters = getUpdatedFiltersOnMyProjectsAllProjects(
          projectManagerName,
          values.filters,
          false
        );
        setFieldValue('filters', updatedFilters);
        return;
      }
    }
  }, [values.showBy]);

  useEffect(() => {
    if (values?.showBy === 'MyTeams' && email) {
      const allocationManagerName = getResourceFromEmail(
        email,
        resources?.result || []
      )?.FullName;

      if (!isMyTeamsValid(allocationManagerName, values.filters)) {
        setFieldValue('showBy', 'AllTeams');
      }
    } else if (values?.showBy === 'MyProject' && email) {
      const projectManager = getResourceFromEmail(
        email,
        resources?.result || []
      );

      const projectManagerName = projectManager
        ? `${projectManager?.FullName}`.trim()
        : '';

      if (!isMyProjectsValid(projectManagerName, values.filters)) {
        setFieldValue('showBy', 'AllProject');
      }
    }
  }, [values.filters]);

  const StyledContainer = styled(Box)(({ theme }) => ({
    marginBottom: 3,
  }));

  const StyledOptionsLabel = styled(Typography)(({ theme }) => ({
    fontFamily: 'Open Sans',
    fontSize: '14px',
  }));

  const StyledExtraInfoText = styled(Typography)(({ theme }) => ({
    color: '#D24546',
    fontFamily: 'Open Sans',
    fontSize: '10px',
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: '180%',
  }));

  const handleDateField = (StartDate, EndDate) => {
    const currentDate = new Date();
    const { weekMinus, weekPlus } = calculateWeekRanges(
      StartDate,
      EndDate,
      currentDate
    );
    setFieldValue('dynamicDateRangeAdd', weekPlus);
    setFieldValue('dynamicDateRangeSubtract', weekMinus);
  };
  return (
    <Box>
      {/* Group By */}
      <StyledContainer>
        <StyledLabel>View By</StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={viewByOptions || []}
          disableClearable
          getOptionLabel={option => option?.label || ''}
          value={viewByOptions.find(option => option.value === values.groupBy)}
          onChange={(event, newValue) => {
            handleGroupByChange(newValue);
          }}
          slotProps={commonSlotProps}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select View By"
              variant="outlined"
              error={
                formikProps.touched.groupBy &&
                Boolean(formikProps.errors.groupBy)
              }
              helperText={
                formikProps.touched.groupBy && formikProps.errors.groupBy
              }
              FormHelperTextProps={{
                sx: {
                  fontSize: '12px',
                  textAlign: 'left',
                  marginLeft: '0px',
                },
              }}
            />
          )}
        />
        {values.groupBy && (
          <StyledExtraInfoText>
            {`* ${viewByOptions?.find(option => option.value === values.groupBy)?.extraInfo}`}
          </StyledExtraInfoText>
        )}
        {showError('groupBy')}
      </StyledContainer>
      <Box sx={{ borderTop: '1px solid #E5E7EB', my: 2 }} />

      {/* Show by */}
      <StyledContainer>
        <StyledLabel>Quick Filter</StyledLabel>
        {values?.groupBy === 'Teams' ||
        values?.groupBy === 'Organisations' ||
        values?.groupBy === 'Resources' ||
        values?.groupBy === 'Flat' ? (
          <RadioGroup
            name="showBy"
            value={values?.showBy || 'MyTeams'}
            onChange={handleChange}
            onBlur={handleBlur}
            row
            sx={{ gap: 2 }}
          >
            <FormControlLabel
              value="MyTeams"
              control={<Radio size="small" />}
              label={<StyledOptionsLabel>My Teams</StyledOptionsLabel>}
            />
            <FormControlLabel
              value="AllTeams"
              control={<Radio size="small" />}
              label={<StyledOptionsLabel>All Teams</StyledOptionsLabel>}
            />
          </RadioGroup>
        ) : (
          <RadioGroup
            name="showBy"
            value={values?.showBy || 'MyProject'}
            onChange={handleChange}
            onBlur={handleBlur}
            row
            sx={{ gap: 2 }}
          >
            <FormControlLabel
              value="MyProject"
              control={<Radio size="small" />}
              label={<StyledOptionsLabel>My Projects</StyledOptionsLabel>}
            />
            <FormControlLabel
              value="AllProject"
              control={<Radio size="small" />}
              label={<StyledOptionsLabel>All Projects</StyledOptionsLabel>}
            />
          </RadioGroup>
        )}
        {showError('showBy')}
      </StyledContainer>
      <Box sx={{ borderTop: '1px solid #E5E7EB', my: 2 }} />

      {/* Filters */}
      <StyledContainer>
        <StyledLabel>Advanced Filters</StyledLabel>
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Typography
              sx={{
                flex: 1,
                fontFamily: 'Open Sans',
                fontSize: '14px',
                color: '#6B7280',
              }}
            >
              Columns
            </Typography>
            <Typography
              sx={{
                flex: 1,
                fontFamily: 'Open Sans',
                fontSize: '14px',
                color: '#6B7280',
                pl: 1.5,
              }}
            >
              Operator
            </Typography>
            <Typography
              sx={{
                flex: 1,
                fontFamily: 'Open Sans',
                fontSize: '14px',
                color: '#6B7280',
              }}
            >
              Value
            </Typography>
          </Box>

          {values.filters &&
            values.filters.map((filter, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <CustomSelect
                    name={`filters[${index}].field`}
                    options={columnOptions}
                    value={filter.field}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    width="100%"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomSelect
                    name={`filters[${index}].operator`}
                    options={operatorOptions}
                    value={filter.operator}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    width="100%"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  {filter.operator === 'isAnyOf' ? ( // UI Not right has to be fixed.
                    <StyledInput
                      disabled={true}
                      as={TextField}
                      name={`filters[${index}].value`}
                      value={filter.value}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  ) : (
                    filter.operator !== 'isEmpty' &&
                    filter.operator !== 'isNotEmpty' && (
                      <StyledInput
                        as={TextField}
                        name={`filters[${index}].value`}
                        value={filter.value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={
                          filter.operator === 'isEmpty' ||
                          filter.operator === 'isNotEmpty'
                        }
                      />
                    )
                  )}
                </Box>
              </Box>
            ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<Plus size={16} />}
            onClick={addFilter}
            sx={{
              color: '#1C2D5F',
              fontFamily: 'Open Sans',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Add Filter
          </Button>

          <Button
            onClick={removeAllFilters}
            sx={{
              color: '#1C2D5F',
              fontFamily: 'Open Sans',
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'none',
            }}
            startIcon={<DeleteOutlinedIcon />}
          >
            Remove All
          </Button>
        </Box>
      </StyledContainer>
      <Box sx={{ borderTop: '1px solid #E5E7EB', my: 2 }} />

      {/* Date Range */}
      <StyledContainer>
        <StyledLabel>Date Range</StyledLabel>

        {/* Dynamic Range */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            value="dynamic"
            control={
              <Radio
                size="small"
                checked={values.dateRangeType === 'dynamic'}
                onChange={() => setFieldValue('dateRangeType', 'dynamic')}
                onBlur={handleBlur}
              />
            }
            label={<StyledOptionsLabel>Dynamic Range</StyledOptionsLabel>}
          />

          {values.dateRangeType === 'dynamic' && (
            <Box sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                  onClick={handleSubtractWeek}
                >
                  <IconButton size="small" sx={{ p: 0 }}>
                    <img src="/images/icons/minus-circle.svg" alt="Plus" />
                  </IconButton>
                  <StyledOptionsLabel>Week</StyledOptionsLabel>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    pl: 3.5,
                    borderLeft: '1px solid #E5E7EB',
                    borderRight: '1px solid #E5E7EB',
                    fontSize: '12px',
                    fontFamily: 'Open Sans',
                    fontWeight: 500,
                  }}
                >
                  Current Week
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                  onClick={handleAddWeek}
                >
                  <IconButton size="small" sx={{ p: 0 }}>
                    <img src="/images/icons/plus-circle.svg" alt="Minus" />
                  </IconButton>
                  <StyledOptionsLabel>Week</StyledOptionsLabel>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-evenly',
                  mt: 1,
                  gap: 4,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Open Sans',
                    fontSize: '12px',
                    color: '#6B7280',
                  }}
                >
                  {getDateFromWeekMath(
                    new Date(),
                    'SUBTRACT',
                    values?.dynamicDateRangeSubtract
                  )}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Open Sans',
                    fontSize: '12px',
                    color: '#6B7280',
                  }}
                >
                  {format(new Date(), 'dd MMM yy')}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'Open Sans',
                    fontSize: '12px',
                    color: '#6B7280',
                  }}
                >
                  {getDateFromWeekMath(
                    new Date(),
                    'ADD',
                    values?.dynamicDateRangeAdd
                  )}
                </Typography>
              </Box>
              {(errors.dynamicDateRangeAdd ||
                errors.dynamicDateRangeSubtract) && (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: '12px',
                    color: 'red',
                    fontFamily: 'Open Sans',
                    fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  {errors.dynamicDateRangeAdd ||
                    errors.dynamicDateRangeSubtract}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Fixed Range */}
        <Box>
          <FormControlLabel
            value="fixed"
            control={
              <Radio
                size="small"
                checked={values.dateRangeType === 'fixed'}
                onChange={() => setFieldValue('dateRangeType', 'fixed')}
                onBlur={handleBlur}
              />
            }
            label={<StyledOptionsLabel>Fixed Range</StyledOptionsLabel>}
          />
        </Box>
      </StyledContainer>
      {values.dateRangeType === 'fixed' && (
        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <CustomDateRangePicker
              name="DateRange"
              value={{
                startDate: formikProps.values.startDate,
                endDate: formikProps.values.endDate,
              }}
              placeholder="Select Date Range"
              formikProps={formikProps}
              error={
                (formikProps.touched.dynamicDateRangeAdd ||
                  formikProps.touched.dynamicDateRangeSubtract) &&
                (Boolean(formikProps.errors.dynamicDateRangeAdd) ||
                  Boolean(formikProps.errors.dynamicDateRangeSubtract))
              }
              helperText={
                (formikProps.touched.dynamicDateRangeAdd &&
                  formikProps.errors.dynamicDateRangeAdd) ||
                (formikProps.touched.dynamicDateRangeSubtract &&
                  formikProps.errors.dynamicDateRangeSubtract)
              }
              customStyles={true}
              handleDateField={handleDateField}
            />
          </Box>
        </Box>
      )}
      {showError('dateRangeType')}
      <Box sx={{ borderTop: '1px solid #E5E7EB', my: 2 }} />

      {/* Show Columns */}
      <StyledContainer>
        <StyledLabel>Show Columns</StyledLabel>
        <MultiSelectWithChips
          list={columnOptions}
          selected={formatedColumnValues}
          updateSelected={handleColumnUpdate}
        />
      </StyledContainer>
    </Box>
  );
};

export default SaveViewForm;
