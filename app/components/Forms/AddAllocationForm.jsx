'use client';

import { useEffect, useState } from 'react';
import {
  TextField,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Input,
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import {
  StyledCommentInput,
  StyledFormHelperText,
  StyledInput,
} from '../Input/StyledInput';
import StyledRadioButton from '../RadioButton/StyledRadioButton';
import { useSelector } from 'react-redux';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import { useDispatch } from 'react-redux';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { getProjectRangeWarnings } from './ValidationSchema';
import { AllocationForm_Status_Filter, PROJECT_ACTIVE_STATUS } from '@/app/constants/constants';

const AddAllocationForm = ({ formikProps, setFormValue }) => {
  const { values, handleChange, handleBlur, setFieldValue } = formikProps;
  const [capacityOption, setCapacityOption] = useState('');
  const [customCapacity, setCustomCapacity] = useState('');
  const [projectOptions, setProjectOptions] = useState([]);
  const { projects } = useSelector(state => state.projects);
  const { resources } = useSelector(state => state.resources);
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const [multipleResourceError, setMultipleResourceError] = useState(false);
  const [multipleProjectError, setMultipleProjectError] = useState(false);
  const [closeResourceMenu, setCloseResourceMenu] = useState(false);
  const [closeProjectMenu, setCloseProjectMenu] = useState(false);
  const dispatch = useDispatch();

  const warnings = getProjectRangeWarnings(values, projects);

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

  useEffect(() => {
    if (initialData) {
      const filteredProject = projects
        ?.filter(project => initialData.Project?.includes(project.Name))
        .map(projects => projects.Id);
      const filteredResource = resources
        ?.filter(resource => initialData.Resource?.includes(resource.FullName))
        .map(resource => resource.Id);
      const rowData = {
        Resource: filteredResource || [],
        Project: filteredProject || [],
        StartDate: initialData.StartDate || '',
        EndDate: initialData.EndDate || '',
        AllocationEntered: initialData.AllocationEntered || '',
      };
      setFormValue(rowData);
    }
  }, [initialData, projects]);

  useEffect(() => {
    const avaiableProjects = projects
      ?.filter(project => PROJECT_ACTIVE_STATUS.includes(project.Status))
      ?.sort((a, b) => a.Name.localeCompare(b.Name))
      ?.map(project => ({
        value: project.Id,
        label: project.Name,
      }));
    setProjectOptions(avaiableProjects);
  }, [projects]);

  const resourceTypeOptions =
    resources
    ?.filter(resource => AllocationForm_Status_Filter.includes(resource.Status))
    ?.sort((a, b) => a.FullName.localeCompare(b.FullName))
    ?.map(resource => ({
      value: resource.Id,
      label: resource.FullName,
    })) || [];


  const handleCapacityChange = event => {
    const value = event.target.value;
    setCapacityOption(value);
    if (value === 'custom') {
      setFieldValue('allocationEntered', Number(customCapacity));
    } else {
      setCustomCapacity('');
      setFieldValue('AllocationEntered', Number(value));
    }
  };

  const handleKeyPress = e => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleCustomCapacityChange = event => {
    const value = event.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setCustomCapacity(value);
      setCapacityOption('custom');
      const numValue = value === '' ? '' : Number(value);
      setFieldValue('AllocationEntered', numValue);
    }
  };

  const handleCustomCapacityBlur = e => {
    let formattedValue = e.target.value;
    if (formattedValue && !isNaN(formattedValue)) {
      const numValue = Number(formattedValue);
      formattedValue = (Math.round(numValue * 10) / 10).toString();
      if (formattedValue.indexOf('.') === -1 && numValue <= 2) {
        formattedValue = formattedValue + '.0';
      }
      setCustomCapacity(formattedValue);
      setFieldValue('AllocationEntered', Number(formattedValue));
    }
    handleBlur(e);
  };

  const handleResourceChange = (event, newValue) => {
    if (values.Project.length > 1 && newValue.length > 1) {
      setMultipleResourceError(true);
      setFieldValue('Resource', [newValue[newValue.length - 1].value]);
      setTimeout(() => {
        setMultipleResourceError(false);
      }, 4000);
      return;
    } else {
      setMultipleResourceError(false);
    }
    handleChange({
      target: { name: 'Resource', value: newValue.map(item => item.value) },
    });
  };

  const handleProjectChange = (event, newValue) => {
    if (values.Resource.length > 1 && newValue.length > 1) {
      setMultipleProjectError(true);
      setFieldValue('Project', [newValue[newValue.length - 1].value]);
      setTimeout(() => {
        setMultipleProjectError(false);
      }, 4000);
      return;
    } else {
      setMultipleProjectError(false);
    }
    handleChange({
      target: { name: 'Project', value: newValue.map(item => item.value) },
    });
  };

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Resource <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          multiple
          size="small"
          options={resourceTypeOptions || []}
          getOptionLabel={option => option?.label || ''}
          value={
            Array.isArray(values.Resource)
              ? resourceTypeOptions?.filter(option =>
                  values.Resource.includes(option.value)
                ) || []
              : []
          }
          onChange={handleResourceChange}
          slotProps={commonSlotProps}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Resource"
              variant="outlined"
              error={
                formikProps.touched.Resource &&
                Boolean(formikProps.errors.Resource)
              }
              helperText={
                formikProps.touched.Resource && formikProps.errors.Resource
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
        {multipleResourceError && (
          <StyledFormHelperText>
            Only one Resource can be selected, when multiple Projects are
            selected.
          </StyledFormHelperText>
        )}
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project
          <span style={{ color: 'red' }}> *</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          multiple
          size="small"
          options={projectOptions || []}
          getOptionLabel={option => option?.label || ''}
          value={
            Array.isArray(values.Project)
              ? projectOptions?.filter(option =>
                  values.Project.includes(option.value)
                ) || []
              : []
          }
          onChange={handleProjectChange}
          slotProps={commonSlotProps}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Project"
              variant="outlined"
              error={
                formikProps.touched.Project &&
                Boolean(formikProps.errors.Project)
              }
              helperText={
                formikProps.touched.Project && formikProps.errors.Project
              }
              FormHelperTextProps={{
                sx: {
                  fontSize: '12px',
                  textAlign: 'left',
                  marginLeft: '0px',
                },
              }}
              sx={{ fontSize: '12px', '&::placeholder': { fontSize: '10px' } }}
            />
          )}
        />
        {multipleProjectError && (
          <StyledFormHelperText>
            Only one Project can be selected, when multiple Resources are
            selected.
          </StyledFormHelperText>
        )}
      </Box>

      <Box>
        <Box sx={{ pb: 2, pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CustomDateRangePicker
              name="StartDate"
              value={{
                StartDate: formikProps.values.StartDate,
                EndDate: formikProps.values.EndDate,
              }}
              placeholder="Select Date"
              formikProps={formikProps}
              error={
                formikProps.touched.StartDate &&
                Boolean(formikProps.errors.StartDate)
              }
              helperText={
                formikProps.touched.StartDate && formikProps.errors.StartDate
              }
              customStyles={true}
              title={
                <>
                  Date Range <span style={{ color: 'red' }}>*</span>
                </>
              }
            />
          </Box>
          {warnings.map((msg, i) => (
            <div key={i}>
              <Typography
                variant="caption"
                color={'warning'}
                sx={{ fontSize: '12px' }}
              >
                {msg}
              </Typography>
              {i < warnings.length - 1 && <br />}
            </div>
          ))}
        </Box>
        <Box
          sx={{
            background: 'rgba(28, 45, 95, 0.05)',
            height: '33px',
            width: '340px',
            p: 1,
          }}
        >
          <Typography
            sx={{
              color: '#313F68',
              fontFamily: theme => theme.typography.fontFamily,
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '700',
            }}
          >
            Add Bulk Allocation
          </Typography>
        </Box>
        <Box sx={{ pb: 2, pt: 2, ml: 1 / 2 }}>
          <Box
            sx={{
              pb: 1 / 2,
              pr: 2,
              pt: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '126px',
              }}
            >
              <StyledLabel>
                Allocation Value
                <span style={{ color: 'red' }}>*</span>
              </StyledLabel>
              <StyledLabel>Custom</StyledLabel>
            </Box>
          </Box>
          <RadioGroup
            row
            name="capacity-radio-group"
            value={capacityOption}
            onChange={handleCapacityChange}
            sx={{ display: 'flex', alignItems: 'center', gap: '22px' }}
          >
            <StyledRadioButton
              value="1.0"
              label="1.0"
              selectedValue={capacityOption}
              onChange={handleCapacityChange}
              backgroundColor="#e6f7e6"
              borderColor="#a3d9a3"
              sx={{ fontWeight: capacityOption === '1.0' ? 'bold' : 'normal' }}
            />
            <StyledRadioButton
              value="0.5"
              label="0.5"
              selectedValue={capacityOption}
              onChange={handleCapacityChange}
              backgroundColor="#fff8e6"
              borderColor="#ffd580"
              sx={{
                fontWeight: capacityOption === '1.0' ? 'bold' : 'normal',
              }}
            />
            <StyledRadioButton
              value="0.2"
              label="0.2"
              selectedValue={capacityOption}
              onChange={handleCapacityChange}
              backgroundColor="#fde6ef"
              borderColor="#f8b3d9"
              sx={{
                fontWeight: capacityOption === '1.0' ? 'bold' : 'normal',
              }}
            />
            <FormControlLabel
              value="custom"
              control={<Radio sx={{ display: 'none' }} />}
              label={
                <StyledInput
                  as={TextField}
                  name="AllocationEntered"
                  type="number"
                  width="60px"
                  height="32px"
                  value={customCapacity}
                  onChange={handleCustomCapacityChange}
                  onKeyPress={handleKeyPress}
                  onBlur={handleCustomCapacityBlur}
                  onClick={() => setCapacityOption('custom')}
                  error={
                    formikProps.touched.AllocationEntered &&
                    Boolean(formikProps.errors.AllocationEntered)
                  }
                  className={capacityOption === 'custom' ? 'bold-input' : ''}
                />
              }
              sx={{ margin: 0 }}
            />
          </RadioGroup>
          {formikProps.touched.AllocationEntered &&
            Boolean(formikProps.errors.AllocationEntered) && (
              <StyledFormHelperText>
                {formikProps.errors.AllocationEntered}
              </StyledFormHelperText>
            )}
        </Box>
      </Box>

      <Box sx={{ pb: 2, pt: 2 }}>
        <StyledLabel>Comment</StyledLabel>
        <StyledCommentInput
          name="Comment"
          value={values.Comment || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          multiline
          rows={4}
        />
      </Box>
    </Box>
  );
};

export default AddAllocationForm;
