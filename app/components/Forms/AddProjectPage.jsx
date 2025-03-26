import React from 'react';
import { Box, TextField } from '@mui/material';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const AddProjectForm = ({ formikProps }) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
  } = formikProps;

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <TextField
          label="Project Name"
          name="Name"
          value={values.Name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <TextField
          label="Owner"
          name="Owner"
          value={values.Owner}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Owner && Boolean(errors.Owner)}
          helperText={touched.Owner && errors.Owner}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <TextField
          label="Manager"
          name="Manager"
          value={values.Manager}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Manager && Boolean(errors.Manager)}
          helperText={touched.Manager && errors.Manager}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <TextField
          label="Location"
          name="Location"
          value={values.Location}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Location && Boolean(errors.Location)}
          helperText={touched.Location && errors.Location}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <CustomSelect
          name="Type"
          label="Project Type"
          value={values.Type}
          onChange={(value) => setFieldValue('Type', value)}
          error={touched.Type && Boolean(errors.Type)}
          helperText={touched.Type && errors.Type}
         
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <CustomSelect
          name="AllowOvertime"
          label="Allow Overtime"
          value={values.AllowOvertime}
          onChange={(value) => setFieldValue('AllowOvertime', value)}
          error={touched.AllowOvertime && Boolean(errors.AllowOvertime)}
          helperText={touched.AllowOvertime && errors.AllowOvertime}
        />
      </Box>

      <Box sx={{ pb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <CustomDatePicker
          name="StartDate"
          label="Start Date"
          value={values.StartDate}
          onChange={(date) => setFieldValue('StartDate', date)}
          error={touched.StartDate && Boolean(errors.StartDate)}
          helperText={touched.StartDate && errors.StartDate}
        />
        <CustomDatePicker
          name="EndDate"
          label="End Date"
          value={values.EndDate}
          onChange={(date) => setFieldValue('EndDate', date)}
          error={touched.EndDate && Boolean(errors.EndDate)}
          helperText={touched.EndDate && errors.EndDate}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <CustomSelect
          name="Status"
          label="Status"
          value={values.Status}
          onChange={(value) => setFieldValue('Status', value)}
          error={touched.Status && Boolean(errors.Status)}
          helperText={touched.Status && errors.Status}
        />
      </Box>
    </Box>
  );
};

export default AddProjectForm;
