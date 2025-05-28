import React, { useEffect } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import { useSelector } from 'react-redux';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import Project from '@/app/(root)/project/page';
import { useDispatch } from 'react-redux';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';

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
  const dispatch = useDispatch();

  const resourceTypeOptions =
    resources?.result?.map(resource => ({
      value: resource.Id,
      label: resource.FullName,
    })) || [];

  useEffect(() => {
    if (!resources || !resources?.result) {
      dispatch(fetchAllResources());
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
        <StyledLabel>Project Sponsor</StyledLabel>
        <CustomSelect
          name="ProjectSponsor"
          options={resourceTypeOptions}
          value={values.ProjectSponsor || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          width={'100%'}
          error={touched.ProjectSponsor && Boolean(errors.ProjectSponsor)}
          helperText={
            touched.ProjectSponsor && formikProps.errors.ProjectSponsor
          }
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
        <CustomSelect
          name="ProjectManager"
          options={resourceTypeOptions}
          value={values.ProjectManager || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          width={'100%'}
          error={touched.ProjectManager && Boolean(errors.ProjectManager)}
          helperText={formikProps.errors.ProjectManager}
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
        }}
      >
        <Box>
          <StyledLabel>
            Project Type <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <CustomSelect
            name="Type"
            options={projectTypeOptions}
            value={values.Type || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            width={'160px'}
            error={touched.Type && Boolean(errors.Type)}
            helperText={formikProps.errors.Type}
          />
        </Box>
        <Box>
          <StyledLabel>
            Allow Overtime <span style={{ color: 'red' }}>*</span>
          </StyledLabel>
          <CustomSelect
            name="AllowOvertime"
            options={allowOverTimeOptions}
            value={values.AllowOvertime ?? ''}
            onChange={handleChange}
            onBlur={handleBlur}
            width={'160px'}
            error={touched.AllowOvertime && Boolean(errors.AllowOvertime)}
            helperText={formikProps.errors.AllowOvertime}
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
        <CustomSelect
          name="Status"
          options={statusOptions}
          value={values.Status || ''}
          onChange={handleChange}
          width={'100%'}
          onBlur={handleBlur}
          error={touched.Status && Boolean(errors.Status)}
          helperText={formikProps.errors.Status}
        />
      </Box>
    </Box>
  );
};

export default AddProjectForm;
