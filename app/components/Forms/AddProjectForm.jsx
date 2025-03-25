import React, { useEffect } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import { useSelector } from 'react-redux';

const AddProjectForm = ({ formikProps, setFormValue =()=>{}}) => {
  const { values, handleChange, handleBlur } = formikProps;
  const {initialData } = useSelector(state => state.globalDialog.formState);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        StartDate: initialData.StartDate || '',
        EndDate: initialData.EndDate || '',
        Owner: initialData.Owner?.name || '',
        AllowOvertime: initialData.AllowOvertime,
        Location: initialData.Location || '',
        Manager: initialData.Manager || '',
        Name: initialData.Name || '',
        Type: initialData.Type || '',
        Status: initialData.Status || '',
      };
      setFormValue(rowData);
    }
  }, [initialData]);

  const projectTypeOptions = [
    { value: 'Key Initiative', label: 'Key Initiative' },
    { value: 'RTB', label: 'RTB (Run-th-business)' },
    { value: 'CTB', label: 'CTB' },
    { value: 'STB', label: 'STB' },
    { value: 'Ongoing', label: 'Ongoing' },
  ];
  const allowOverTimeOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Proposed', label: 'Proposed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Paused', label: 'Paused' },
    { value: 'Terminated', label: 'Terminated' },
  ];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project Name</StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          value={values.Name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Sponsor</StyledLabel>
        <StyledInput
          as={TextField}
          name="Owner"
          value={values.Owner}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Manager</StyledLabel>
        <StyledInput
          as={TextField}
          name="Manager"
          value={values.Manager}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Location</StyledLabel>
        <StyledInput
          as={TextField}
          name="Location"
          value={values.Location}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <StyledLabel>Project Type</StyledLabel>
          <CustomSelect
            name="Type"
            options={projectTypeOptions}
            value={values.Type}
            onChange={handleChange}
            onBlur={handleBlur}
            width={'160px'}
          />
        </Box>
        <Box>
          <StyledLabel>Allow Overtime</StyledLabel>
          <CustomSelect
            name="AllowOvertime"
            options={allowOverTimeOptions}
            value={values.AllowOvertime}
            onChange={handleChange}
            onBlur={handleBlur}
            width={'160px'}
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
        <Box>
          <StyledLabel>Start Date</StyledLabel>
          <CustomDatePicker
            name="StartDate"
            handleChange={handleChange}
            value={values.StartDate}
            placeholder={'Start Date'}
            formikProps={formikProps}
          />
        </Box>
        <Box>
          <StyledLabel>End Date</StyledLabel>
          <CustomDatePicker
            name="EndDate"
            handleChange={handleChange}
            value={values.EndDate}
            placeholder={'End Date'}
            formikProps={formikProps}
          />
        </Box>
      </Box>
      <StyledLabel>Status</StyledLabel>
          <CustomSelect
            name="Status"
            options={statusOptions}
            value={values.Status}
            onChange={handleChange}
            onBlur={handleBlur}
          />
    </Box>
  );
};

export default AddProjectForm;
