import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import {
  addAllocationValidationSchema,
  addProjectValidationSchema,
} from './ValidationSchema';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';

// Initial Form Values
const initialValues = {
  team: '',
  design: '',
  resource: '',
  resourceType: '',
  project: '',
  allocate: '',
  week: '',
  capacity: '',
};

const AddAllocationForm = ({ formikProps }) => {
  const { values, handleChange, handleBlur } = formikProps;

  const teamOptions = [
    { value: 'Team A', label: 'Team A' },
    { value: 'Team B', label: 'Team B' },
    { value: 'Team C', label: 'Team C' },
  ];

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
      {/* Resource Field */}
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
      {/* Project Field */}
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
              fontFamily: 'Manrope',
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
        </Box>
        <Box>
          <StyledLabel>Capacity</StyledLabel>
          {/* Capacity Field */}
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
