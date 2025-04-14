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
} from '@mui/material';
import { X, Plus } from 'lucide-react';
import StyledLabel from '../Label/StyledLabel';
import CustomSelect from '../Select/CustomSelect';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import { StyledInput } from '../Input/StyledInput';
import MultiSelectWithChips from '../Select/MultiSelectWithChipSmaller';
import { getTodaysDateDDMMMYYYY } from '@/app/utils/dateUtils';
import { addWeeks, format, startOfWeek, subWeeks } from 'date-fns';

const getColumnLabel = column => {
  const columnLabels = {
    __row_group_by_columns_group_teams__: 'Teams Name',
    __row_group_by_columns_group_resource__: 'Resource',
    resource: 'Resource',
    project: 'Project',
    teams: 'Team',
    teamStatus: 'Status',
    teamAllocationManager: 'Allocation Manager',
    resourceType: 'Resource Type',
    projectSponsor: 'Project Sponsor',
    projectManager: 'Project Manager',
    projectStatus: 'Status',
    projectLocation: 'Location',
    projectType: 'Project Type',
    projectOvertimeAllowed: 'Overtime',
    projectCost: 'Cost',
    projectCurrency: 'Currency',
    projectStartDate: 'Start Date',
    projectEndDate: 'End Date',
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

  const columnOptions =
    values?.groupBy === 'Teams'
      ? columns.team.map(column => ({
          id: column,
          value: column,
          label: getColumnLabel(column),
        }))
      : columns.project.map(column => ({
          id: column,
          value: column,
          label: getColumnLabel(column),
        }));

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

  const handleAddWeek = () => {
    setFieldValue('dynamicDateRangeAdd', values.dynamicDateRangeAdd + 1);
  };

  const handleSubtractWeek = () => {
    setFieldValue(
      'dynamicDateRangeSubtract',
      values.dynamicDateRangeSubtract + 1
    );
  };

  useEffect(() => {
    const initialData = {
      groupBy: currentView?.GroupBy || 'Teams',
      showBy:
        currentView?.GroupBy === 'Teams'
          ? currentView?.MyTeam
            ? 'MyTeams'
            : 'allTeams'
          : currentView?.MyProjects
            ? 'myProjects'
            : 'allProjects',
      dateRangeType:
        currentView?.isDynamicRange || currentView?.isDefaultRange
          ? 'dynamic'
          : 'fixed',
      dynamicDateRangeAdd: currentView?.isDefaultRange
        ? 19
        : currentView?.WeekPlus || 0,
      dynamicDateRangeSubtract: currentView?.isDefaultRange
        ? 1
        : currentView?.WeekMinus || 0,
      startDate: '',
      endDate: '',
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

  const StyledContainer = styled(Box)(({ theme }) => ({
    marginBottom: 3,
  }));

  const StyledOptionsLabel = styled(Typography)(({ theme }) => ({
    fontFamily: 'Open Sans',
    fontSize: '14px',
  }));

  return (
    <Box>
      {/* Group By */}
      <StyledContainer>
        <StyledLabel>Group By</StyledLabel>
        <RadioGroup
          name="groupBy"
          value={values?.groupBy || 'Teams'}
          onChange={handleChange}
          onBlur={handleBlur}
          row
          sx={{ gap: 2 }}
        >
          <FormControlLabel
            value="Teams"
            control={<Radio size="small" />}
            label={<StyledOptionsLabel>Teams</StyledOptionsLabel>}
          />
          <FormControlLabel
            value="Project"
            control={<Radio size="small" />}
            label={<StyledOptionsLabel>Project</StyledOptionsLabel>}
          />
        </RadioGroup>
        {showError('groupBy')}
      </StyledContainer>
      <Box sx={{ borderTop: '1px solid #E5E7EB', my: 2 }} />

      {/* Show by */}
      <StyledContainer>
        <StyledLabel>Quick Filter</StyledLabel>
        {values?.groupBy === 'Teams' ? (
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
              value="allTeams"
              control={<Radio size="small" />}
              label={<StyledOptionsLabel>All Teams</StyledOptionsLabel>}
            />
          </RadioGroup>
        ) : (
          <RadioGroup
            name="showBy"
            value={values?.showBy || 'myProjects'}
            onChange={handleChange}
            onBlur={handleBlur}
            row
            sx={{ gap: 2 }}
          >
            <FormControlLabel
              value="myProjects"
              control={<Radio size="small" />}
              label={<StyledOptionsLabel>My Projects</StyledOptionsLabel>}
            />
            <FormControlLabel
              value="allProjects"
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
                  {filter.operator !== 'isEmpty' &&
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

          {values.dateRangeType === 'fixed' && (
            <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CustomDatePicker
                  name="startDate"
                  handleChange={handleChange}
                  value={values.startDate || ''}
                  placeholder="Start Date"
                  formikProps={formikProps}
                  error={touched.startDate && Boolean(errors.startDate)}
                />
                {showError('startDate')}
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomDatePicker
                  name="endDate"
                  handleChange={handleChange}
                  value={values.endDate || ''}
                  placeholder="End Date"
                  formikProps={formikProps}
                  error={touched.endDate && Boolean(errors.endDate)}
                />
                {showError('endDate')}
              </Box>
            </Box>
          )}
        </Box>
        {showError('dateRangeType')}
      </StyledContainer>

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
