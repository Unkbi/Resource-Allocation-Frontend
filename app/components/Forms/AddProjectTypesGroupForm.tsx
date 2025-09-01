'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
export interface ProjectTypeGroup {
  Name: string;
}

import { FormikProps } from 'formik';
import { StyledInput } from '../Input/StyledInput';

interface AddProjectTypesGroupForm {
  formikProps: FormikProps<ProjectTypeGroup>;
}

const AddProjectTypesGroupForm = ({
  formikProps,
}: AddProjectTypesGroupForm) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const [projectTypeGroupName, setProjectTypeGroupName] = useState('');

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project Type Group Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          placeholder="Enter Name"
          fullWidth
          onChange={e => {
            handleChange(e);
            setProjectTypeGroupName(e.target.value);
          }}
          onBlur={handleBlur}
          value={values.Name || ''}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
        />
      </Box>
    </Box>
  );
};

export default AddProjectTypesGroupForm;
