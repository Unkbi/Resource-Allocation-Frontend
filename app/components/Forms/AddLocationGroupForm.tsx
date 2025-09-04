'use client';

import { useEffect, useState } from 'react';
import { TextField, Box, Autocomplete } from '@mui/material';
import StyledLabel from '../Label/StyledLabel';
import {
  StyledInput,
} from '../Input/StyledInput';
import { useSelector, useDispatch } from 'react-redux';
import { FormikProps } from 'formik';


interface FormValues {
  LocationGroup: string;
  [key: string]: any;
}

interface AddLocationGroupFormProps {
  formikProps: FormikProps<FormValues>;
}

const AddLocationGroupForm = ({ formikProps }: AddLocationGroupFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue,touched,errors} = formikProps;
  const dispatch = useDispatch();
  const [locationGroupName, setLocationGroupName] = useState('');


  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Location Group Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="LocationGroup"
          placeholder="Enter Name"
          fullWidth
          onChange={e => {
            handleChange(e);
            setLocationGroupName(e.target.value);
          }}
          onBlur={handleBlur}
          value={values.LocationGroup || ''}
          error={touched.LocationGroup && Boolean(errors.LocationGroup)}
          helperText={touched.LocationGroup && errors.LocationGroup}
        />
      </Box>

    </Box>
  );
};

export default AddLocationGroupForm;
