'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Location, LocationGroup } from '@/app/types';
import { FormikProps } from 'formik';
import {
  StyledCommentInput,
  StyledFormInfoText,
  StyledInput,
} from '../Input/StyledInput';

interface FormValues {
  Location: Location | null;
  LocationGroup: string;
  Status: string;
  [key: string]: any;
}

interface AddLocationFormProps {
  formikProps: FormikProps<FormValues>;
}

const AddLocationForm = ({ formikProps }: AddLocationFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { resources } = useSelector((state: any) => state.resources);
  // const roles: Role[] = useSelector((state: any) => state.rbac.roles);
  const location_group: any = [];
  const [locationName, setLocationName] = useState('');
  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  const handleAutocompleteChange =
    (field: string) => (_event: any, newValue: any) => {
      setFieldValue(field, newValue || '');
    };

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Location Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Location"
          placeholder="Enter Name "
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(e);
            setLocationName(e.target.value);
          }}
          onBlur={
            handleBlur as React.FocusEventHandler<
              HTMLInputElement | HTMLTextAreaElement
            >
          }
          value={values.Location || ''}
          error={touched.Location && Boolean(errors.Location)}
          helperText={touched.Location && errors.Location}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          {' '}
          Location Group <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={location_group}
          value={values.LocationGroup || ''}
          onChange={handleAutocompleteChange('LocationGroup')}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Location Group"
              variant="outlined"
              error={touched.LocationGroup && Boolean(errors.LocationGroup)}
              helperText={touched.LocationGroup && errors.LocationGroup}
              FormHelperTextProps={{
                sx: { fontSize: '12px', textAlign: 'left', ml: 0 },
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>Status</StyledLabel>
        <Autocomplete
          disableClearable
          sx={commonAutocompleteStyles}
          size="small"
          options={['Active']}
          value={values.Status || 'Active'}
          onChange={handleAutocompleteChange('Status')}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Status"
              variant="outlined"
              error={touched.Status && Boolean(errors.Status)}
              helperText={touched.Status && errors.Status}
              FormHelperTextProps={{
                sx: { fontSize: '12px', textAlign: 'left', ml: 0 },
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default AddLocationForm;
