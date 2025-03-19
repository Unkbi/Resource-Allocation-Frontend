import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomDatePicker from '../DatePicker/CustomDatePicker';

const AddAllocationForm = ({ formikProps }) => {
  const { values, handleChange, handleBlur } = formikProps;
  const projectOptions = [
    { value: 'Design 1', label: 'Design 1' },
    { value: 'Design 2', label: 'Design 2' },
    { value: 'Design 3', label: 'Design 3' },
  ];

  const resourceTypeOptions = [
    { value: 'Type A', label: 'Type A' },
    { value: 'Type B', label: 'Type B' },
    { value: 'Type C', label: 'Type C' },
  ];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Resource</StyledLabel>
        <CustomSelect
          name="resource"
          options={resourceTypeOptions}
          value={values.resource}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Resource</StyledLabel>
        <CustomSelect
          name="project"
          options={projectOptions}
          value={values.project}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box>
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
              fontFamily: 'Open Sans',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '700',
            }}
          >
            Add Bulk Allocation
          </Typography>
        </Box>
        <Box sx={{ pb: 2, pt: 2 }}>
          <StyledLabel>Date Range</StyledLabel>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CustomDatePicker
              handleChange={handleChange}
              value={values.startDate}
              placeholder={'Start Date'}
            />
            <CustomDatePicker
              handleChange={handleChange}
              value={values.endDate}
              placeholder={'Start Date'}
            />
          </Box>
        </Box>
        <Box>
          <StyledLabel>Capacity</StyledLabel>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '22px' }}>
            <StyledInput
              as={TextField}
              name="capacity"
              type="number"
              width="60px"
              value={values.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <StyledInput
              as={TextField}
              name="capacity"
              type="number"
              width="60px"
              value={values.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <StyledInput
              as={TextField}
              name="capacity"
              type="number"
              width="60px"
              value={values.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <StyledInput
              as={TextField}
              name="capacity"
              type="number"
              width="60px"
              value={values.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAllocationForm;
