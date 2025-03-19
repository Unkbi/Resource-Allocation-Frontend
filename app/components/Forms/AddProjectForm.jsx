import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomDatePicker from '../DatePicker/CustomDatePicker';

const AddProjectForm = ({ formikProps }) => {
  const { values, handleChange, handleBlur } = formikProps;
  const options = [
    { value: 'Type A', label: 'Type A' },
    { value: 'Type B', label: 'Type B' },
    { value: 'Type C', label: 'Type C' },
  ];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project Name</StyledLabel>
        <StyledInput
          as={TextField}
          name="projectName"
          value={values.projectName}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Sponser</StyledLabel>
        <StyledInput
          as={TextField}
          name="sponser"
          value={values.sponser}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Manager</StyledLabel>
        <StyledInput
          as={TextField}
          name="manager"
          value={values.manager}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Location</StyledLabel>
        <StyledInput
          as={TextField}
          name="location"
          value={values.location}
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
            name="projectType"
            options={options}
            value={values.projectType}
            onChange={handleChange}
            onBlur={handleBlur}
            width={'160px'}
          />
        </Box>
        <Box>
          <StyledLabel>Allow Overtime</StyledLabel>
          <CustomSelect
            name="allowOvertime"
            options={options}
            value={values.allowOvertime}
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
            name="startDate"
            handleChange={handleChange}
            value={values.startDate}
            placeholder={'Start Date'}
            formikProps={formikProps}
          />
        </Box>
        <Box>
          <StyledLabel>End Date</StyledLabel>
          <CustomDatePicker
            name="endDate"
            handleChange={handleChange}
            value={values.endDate}
            placeholder={'Start Date'}
            formikProps={formikProps}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AddProjectForm;
