import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomDatePicker from '../DatePicker/CustomDatePicker';

const AddProjectForm = ({ formikProps }) => {
  const { values, handleChange, handleBlur } = formikProps;

  const projectTypeOptions = [
    { value: 'Transformation', label: 'Transformation' },
    { value: 'GTB (Grow-the-business)', label: 'GTB (Grow-the-business)' },
    { value: 'RTB (Run-th-business)', label: 'RTB (Run-th-business)' },
    { value: 'PTO', label: 'PTO' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Misc', label: 'Misc' },
  ];
  const allowOverTimeOptions = [
    { value: true, label: "Yes" },
    { value: false, label: 'No' },
  
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Proposed', label: 'Proposed' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Paused', label: 'Paused' },
    { value: 'Completed', label: 'Completed' },
  ];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Name</StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          value={values.Name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Sponser</StyledLabel>
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
