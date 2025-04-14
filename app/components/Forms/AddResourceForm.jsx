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
} from '@mui/material';
import { addResourceValidationSchema } from './ValidationSchema';

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

const AddResourceForm = ({ onSubmit }) => {
  const handleSubmit = values => {
    // Handle form submission (e.g., API call)
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 2 }}>
      <Formik
        initialValues={initialValues}
        validationSchema={addResourceValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur }) => (
          <Form>
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
            <Field
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
            <Field
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
            <Field
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
            <Field
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
            <Field
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Add Allocation
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default AddResourceForm;
