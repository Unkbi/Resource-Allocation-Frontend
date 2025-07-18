import React, { useEffect } from 'react';
import { TextField, Box, Typography, Autocomplete } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import { useSelector } from 'react-redux';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import Project from '@/app/(root)/project/page';
import { useDispatch } from 'react-redux';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';
import StyledAutocomplete from '../Select/Autocomplete';

const AddProjectForm = ({ formikProps, setFormValue = () => {} }) => {
  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    resetForm,
    setTouched,
  } = formikProps;
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { resources } = useSelector(state => state.resources);
  const { portfolios } = useSelector(state => state.portfolios);
  const dispatch = useDispatch();

  const resourceTypeOptions =
    resources?.result?.map(resource => ({
      value: resource.Id,
      label: resource.FullName,
    })) || [];

  const portfolioOptions =
    portfolios
      ?.filter(p => p.Status === 'Active')
      .map(portfolio => ({
        value: portfolio.Id,
        label: portfolio.Name,
      })) || [];

  useEffect(() => {
    if (!resources || !resources?.result) {
      dispatch(fetchAllResources());
    }
    if (!portfolios) {
      dispatch({
        type: FETCH_PORTFOLIOS,
        payload: {},
      });
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        StartDate: initialData.StartDate || null,
        EndDate: initialData.EndDate || null,
        ProjectSponsor:
          resources?.result?.find(
            res => res.FullName === initialData.ProjectSponsor
          )?.Id || '',
        AllowOvertime: initialData.AllowOvertime ?? '',
        Location: initialData.Location || '',
        ProjectManager:
          resources?.result?.find(
            res => res.FullName === initialData.ProjectManager
          )?.Id || '',
        Name: initialData.Name || '',
        PortfolioId: initialData.PortfolioId || '',
        Type: initialData.Type || '',
        Status: initialData.Status || 'Active',
        Budget: initialData.Budget || 0,
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  const projectTypeOptions = [
    { value: 'Key Initiative', label: 'Key Initiative' },
    { value: 'RTB', label: 'RTB' }, //(Run-th-business)
    { value: 'CTB', label: 'CTB' },
    { value: 'STB', label: 'STB' },
    { value: 'Ongoing', label: 'Ongoing' },
  ];
  const allowOverTimeOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Proposed', label: 'Proposed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Paused', label: 'Paused' },
    { value: 'Approved', label: 'Approved' },
  ];

  const helperTextStyles = {
    sx: {
      fontSize: '12px',
      fontFamily: 'Open Sans, sans-serif',
      fontWeight: 400,
      lineHeight: 1.66,
      textAlign: 'left',
      marginTop: '3px',
      marginRight: '14px',
      marginBottom: 0,
      marginLeft: 0,
    },
  };
  
  

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          value={values.Name || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && formikProps.errors.Name}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>{PORTFOLIO_DISPLAY_NAME}</StyledLabel>
        <StyledAutocomplete
          name="PortfolioId"
          // label={PORTFOLIO_DISPLAY_NAME}
          options={portfolioOptions}
          value={values.PortfolioId}
          formikProps={formikProps}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project Sponsor</StyledLabel>
        <StyledAutocomplete
          name="ProjectSponsor"
          // label="Project Sponsor"
          options={resourceTypeOptions}
          value={values.ProjectSponsor}
          formikProps={formikProps}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project Budget</StyledLabel>
        <StyledInput
          type="number"
          name="Budget"
          value={values.Budget || ''}
          onChange={e => {
            const input = e.target.value;
            const parsed = input === '' ? null : Number(input);
            formikProps.setFieldValue('Budget', parsed);
          }}
          onBlur={handleBlur}
          error={touched.Budget && Boolean(errors.Budget)}
          helperText={touched.Budget && formikProps.errors.Budget}
          onKeyDown={e => {
            if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
              e.preventDefault();
            }
          }}
          InputProps={{
            startAdornment: <span>$&nbsp;</span>,
          }}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project Manager</StyledLabel>
        <StyledAutocomplete
          name="ProjectManager"
          // label="Project Manager"
          options={resourceTypeOptions}
          value={values.ProjectManager}
          formikProps={formikProps}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Location</StyledLabel>
        <StyledInput
          as={TextField}
          name="Location"
          value={values.Location || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Location && Boolean(errors.Location)}
          helperText={touched.Location && formikProps.errors.Location}
        />
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            Project Type <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledAutocomplete
            name="Type"
            // label="Type"
            options={projectTypeOptions}
            value={values.Type}
            formikProps={formikProps}
            FormHelperTextProps={helperTextStyles}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StyledLabel>
            Allow Overtime <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <StyledAutocomplete
            name="AllowOvertime"
            // label="Allow Overtime"
            options={allowOverTimeOptions}
            value={values.AllowOvertime}
            formikProps={formikProps}
            FormHelperTextProps={helperTextStyles}
          />
        </Box>
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <CustomDateRangePicker
          name="StartDate"
          value={{
            StartDate: formikProps.values.StartDate,
            EndDate: formikProps.values.EndDate,
          }}
          placeholder="Select Date"
          endDateLabel="End Date"
          startDateLabel="Start Date"
          formikProps={formikProps}
          error={
            (formikProps.touched.StartDate &&
              Boolean(formikProps.errors.StartDate)) ||
            (formikProps.touched.EndDate && Boolean(formikProps.errors.EndDate))
          }
          helperText={
            (formikProps.touched.StartDate && formikProps.errors.StartDate) ||
            (formikProps.touched.EndDate && formikProps.errors.EndDate)
          }
          customStyles={true}
          isProjectForm={true}
          title="Date Range"
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Status <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          name="Status"
          // label="Status"
          options={statusOptions}
          value={values.Status}
          formikProps={formikProps}
          disableClearable
        />
      </Box>
    </Box>
  );
};

export default AddProjectForm;
