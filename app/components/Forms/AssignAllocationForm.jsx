import React from 'react';
import { Field, ErrorMessage } from 'formik';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
import { StyledInput } from '../Input/StyledInput';

const AssignAllocationForm = ({ formikProps }) => {
  const { values, handleChange, handleBlur } = formikProps;

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      {/* Team Field */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Team</InputLabel>
        <Field
          as={Select}
          name="team"
          label="Team"
          value={values.team}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <MenuItem value="Team A">Team A</MenuItem>
          <MenuItem value="Team B">Team B</MenuItem>
          <MenuItem value="Team C">Team C</MenuItem>
        </Field>
        <ErrorMessage name="team" component="div" />
      </FormControl>

      {/* Design Field */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Design</InputLabel>
        <Field
          as={Select}
          name="design"
          label="Design"
          value={values.design}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <MenuItem value="Design 1">Design 1</MenuItem>
          <MenuItem value="Design 2">Design 2</MenuItem>
          <MenuItem value="Design 3">Design 3</MenuItem>
        </Field>
        <ErrorMessage name="design" component="div" />
      </FormControl>

      {/* Resource Field */}
      <StyledInput
        as={TextField}
        name="resource"
        label="Resource"
        fullWidth
        margin="normal"
        value={values.resource}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ErrorMessage name="resource" component="div" />

      {/* Resource Type Field */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Resource Type</InputLabel>
        <Field
          as={Select}
          name="resourceType"
          label="Resource Type"
          value={values.resourceType}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <MenuItem value="Type A">Type A</MenuItem>
          <MenuItem value="Type B">Type B</MenuItem>
          <MenuItem value="Type C">Type C</MenuItem>
        </Field>
        <ErrorMessage name="resourceType" component="div" />
      </FormControl>

      {/* Project Field */}
      <StyledInput
        as={TextField}
        name="project"
        label="Project"
        fullWidth
        margin="normal"
        value={values.project}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ErrorMessage name="project" component="div" />

      {/* Allocate Field */}
      <StyledInput
        as={TextField}
        name="allocate"
        label="Allocate"
        fullWidth
        margin="normal"
        value={values.allocate}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ErrorMessage name="allocate" component="div" />

      {/* Week Field */}
      <StyledInput
        as={TextField}
        name="week"
        label="Week"
        fullWidth
        margin="normal"
        value={values.week}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ErrorMessage name="week" component="div" />

      {/* Capacity Field */}
      <StyledInput
        as={TextField}
        name="capacity"
        label="Capacity"
        type="number"
        fullWidth
        margin="normal"
        value={values.capacity}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <ErrorMessage name="capacity" component="div" />
    </Box>
  );
};

export default AssignAllocationForm;
