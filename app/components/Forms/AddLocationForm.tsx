'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Location, LocationGroup } from '@/app/types';
import { FormikProps } from 'formik';
import {
  StyledCommentInput,
  StyledFormInfoText,
  StyledInput,
} from '../Input/StyledInput';
import { FETCH_LOCATION_GROUPS } from '@/app/redux/actions/allSettingsActions';

interface FormValues {
  Name: Location | null;
  LocationGroup: string;
  Status: string;
  [key: string]: any;
}

interface AddLocationFormProps {
  formikProps: FormikProps<FormValues>;
  setFormValue: (value: any) => void;
}

const AddLocationForm = ({
  formikProps,
  setFormValue,
}: AddLocationFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { locationGroups } = useSelector((state: any) => state.allSettings);
  const { initialData } = useSelector(
    (state: any) => state.globalDialog.formState
  );
  const [locationGroupName, setLocationGroupName] = useState<string[]>([]);
  const dispatch = useDispatch();
  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  useEffect(() => {
    if (initialData) {
      const rowData = {
        Name: initialData.Name || '',
        LocationGroup: initialData.LocationGroup || '',
        Status: initialData.Status || 'Active',
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }

    const location_group: string[] = [];
    if (locationGroups && Array.isArray(locationGroups)) {
      locationGroups.forEach((item: LocationGroup) => {
        if (item.Name) {
          location_group.push(item.Name);
        }
      });
    }

    setLocationGroupName(location_group);
  }, [locationGroups, initialData]);

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
          name="Name"
          placeholder="Enter Name "
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(e);
            setFieldValue('Name', e.target.value);
          }}
          onBlur={
            handleBlur as React.FocusEventHandler<
              HTMLInputElement | HTMLTextAreaElement
            >
          }
          value={values.Name || ''}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
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
          options={locationGroupName}
          getOptionLabel={(option: string) => option || ''}
          value={values.LocationGroup || ''}
          onChange={handleAutocompleteChange('LocationGroup')}
          renderInput={params => (
            <TextField
              {...params}
              name="LocationGroup"
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
          options={['Active', 'Inactive']}
          value={values.Status || 'Active'}
          onChange={handleAutocompleteChange('Status')}
          renderInput={params => (
            <TextField
              {...params}
              name="Status"
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
