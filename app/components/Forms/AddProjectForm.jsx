import React, { useEffect, useState } from 'react';
import { TextField, Box, Typography, Autocomplete } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import { useSelector } from 'react-redux';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import Project from '@/app/(root)/project/page';
import { useDispatch } from 'react-redux';
import { DATE_FORMAT, PORTFOLIO_DISPLAY_NAME, Resource_Team_Project_Status_Filter } from '@/app/constants/constants';
import StyledAutocomplete from '../Select/Autocomplete';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import { FETCH_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { FETCH_PROJECT_TYPES } from '@/app/redux/actions/allSettingsActions';
import { withRBAC } from '../HOC/withRBAC';

const AddProjectForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}) => {
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
  const { projectTypes } = useSelector(state => state.allSettings);
  const { formType } = useSelector(state => state.globalDialog.formState);
  const { scalarSettings } = useSelector(state => state.allSettings);
  const [readOnly, setReadOnly] = useState(true);
  const dispatch = useDispatch();

  const resourceTypeOptions =
    resources
      ?.filter(resource => Resource_Team_Project_Status_Filter.includes(resource.Status))
      ?.sort((a, b) => a.FullName.localeCompare(b.FullName))
      ?.map(resource => ({
        value: resource.Id,
        label: resource.FullName,
      })) || [];

  const portfolioOptions =
    portfolios
      ?.filter(p => p.Status === 'Active')
      .sort((a, b) => a.Name.localeCompare(b.Name))
      .map(portfolio => ({
        value: portfolio.Id,
        label: portfolio.Name,
      })) || [];

  const projectTypeOptions =
    projectTypes
      ?.filter(pt => pt.Status === 'Active')
      ?.sort((a, b) => a.Name.localeCompare(b.Name))
      ?.map(pt => ({
        value: pt.Id,
        label: pt.Name,
      })) || [];

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_project' && !permissions['Project']?.u) ||
        (formType === 'add_project' && !permissions['Project']?.c)
    );
  }, [readOnly]);

  useEffect(() => {
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
    if (!projectTypes?.length) {
      dispatch({
        type: FETCH_PROJECT_TYPES,
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
          resources?.find(res => res.FullName === initialData.ProjectSponsor)
            ?.Id || '',
        AllowOvertime: initialData.AllowOvertime ? 'Yes' : 'No',
        Location: initialData.Location || '',
        ProjectManager:
          resources?.find(res => res.FullName === initialData.ProjectManager)
            ?.Id || '',
        Name: initialData.Name || '',
        PortfolioId: initialData.PortfolioId || '',
        Type: projectTypes?.find(pT => pT.Name === initialData.Type)?.Id || '',
        Status: initialData.Status || 'Active',
        Budget: initialData.Budget || 0,
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  const allowOverTimeOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
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

  const handleEndDateChange = newDate => {
    if (!newDate || !newDate.isValid?.()) {
      formikProps.setFieldValue('EndDate', null);
      return;
    }

    const formattedEndDate = newDate.format(DATE_FORMAT.toUpperCase());
    formikProps.setFieldValue('EndDate', formattedEndDate);
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
          placeholder="Enter Project Name"
          disabled={readOnly}
          readOnly={readOnly}
          value={values.Name || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && formikProps.errors.Name}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          {scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME}
        </StyledLabel>
        <StyledAutocomplete
          name="PortfolioId"
          disabled={readOnly}
          readOnly={readOnly}
          label={`Select ${scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME} Name`}
          options={portfolioOptions}
          value={values.PortfolioId}
          formikProps={formikProps}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project Sponsor</StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          readOnly={readOnly}
          name="ProjectSponsor"
          label="Select Project Sponsor"
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
          disabled={readOnly}
          readOnly={readOnly}
          value={values.Budget || ''}
          placeholder="Enter Budget"
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
          disabled={readOnly}
          readOnly={readOnly}
          label="Select Project Manager"
          options={resourceTypeOptions}
          value={values.ProjectManager}
          formikProps={formikProps}
        />
      </Box>
      {/* Commenting out location field from  add/edit project form */}
      {/* <Box sx={{ pb: 2 }}>
        <StyledLabel>Location</StyledLabel>
        <StyledInput
          as={TextField}
          name="Location"
          placeholder="Enter Location"
          disabled={readOnly}
          readOnly={readOnly}
          value={values.Location || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Location && Boolean(errors.Location)}
          helperText={touched.Location && formikProps.errors.Location}
        />
      </Box> */}
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
            disabled={readOnly}
            readOnly={readOnly}
            name="Type"
            label="Select Type"
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
            disabled={readOnly}
            readOnly={readOnly}
            label="Select Allow Overtime"
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
        <CustomDatePicker
          name="StartDate"
          disabled={readOnly}
          readOnly={readOnly}
          value={formikProps.values.StartDate || null}
          formikProps={formikProps}
          error={
            formikProps.touched.StartDate &&
            Boolean(formikProps.errors.StartDate)
          }
          helperText={
            formikProps.touched.StartDate && formikProps.errors.StartDate
          }
          label="Start Date"
          placeholder="MM/DD/YYYY"
          title="Start Date"
          isRequired={false}
        />

        <CustomDatePicker
          name="EndDate"
          value={formikProps.values.EndDate || null}
          disabled={readOnly}
          readOnly={readOnly}
          formikProps={formikProps}
          onChange={handleEndDateChange}
          error={
            formikProps.touched.EndDate && Boolean(formikProps.errors.EndDate)
          }
          helperText={
            formikProps.touched.EndDate && formikProps.errors.EndDate
              ? formikProps.errors.EndDate
              : ''
          }
          label="End Date"
          placeholder="MM/DD/YYYY"
          title="End Date"
          isRequired={false}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Status <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          readOnly={readOnly}
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

export default withRBAC(AddProjectForm, ['Project']);
