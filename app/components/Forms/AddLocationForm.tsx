'use client';

import { Box, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Location, LocationGroup } from '@/app/types';
import { FormikProps } from 'formik';
import { StyledInput } from '../Input/StyledInput';
import { RootState } from '@/app/redux/store';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import StyledAutocomplete from '../Select/Autocomplete';

interface FormValues {
  Name: Location | null;
  LocationGroup: string;
  Status: string;
  [key: string]: any;
}

interface AddLocationFormProps {
  formikProps: FormikProps<FormValues>;
  setFormValue: (value: any) => void;
  permissions: Record<string, CrudPermissions>;
}

const AddLocationForm = ({
  formikProps,
  setFormValue,
  permissions,
}: AddLocationFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { locationGroups } = useSelector(
    (state: RootState) => state.allSettings
  );
  const { initialData, formType } = useSelector(
    (state: RootState) => state.globalDialog.formState
  );
  const [readOnly, setReadOnly] = useState(true);
  const [locationGroupName, setLocationGroupName] = useState<LocationGroup[]>(
    []
  );

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_location' && !permissions['WorkLocation']?.u) ||
        (formType === 'add_location' && !permissions['WorkLocation']?.c)
    );
  }, []);

  useEffect(() => {
    setLocationGroupName(locationGroups || []);

    if (initialData) {
      const matchedLocationGroup = locationGroups.find(
        LGrp => LGrp.Name === initialData.LocationGroup
      );

      const rowData = {
        Name: initialData.Name || '',
        LocationGroup: matchedLocationGroup?.Id || '',
        Status: initialData.Status || 'Active',
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [locationGroups, initialData]);

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  const locationGroupNameOptions =
    locationGroupName?.map((locationGroup: LocationGroup) => ({
      value: locationGroup.Id,
      label: locationGroup.Name ?? '',
    })) || [];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Location Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          disabled={readOnly}
          readOnly={readOnly}
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
        <StyledAutocomplete
          disabled={readOnly}
          name="LocationGroup"
          label="Select Location Group"
          options={locationGroupNameOptions}
          value={values.LocationGroup || ''}
          formikProps={formikProps}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>Status</StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          name="Status"
          label="Status"
          options={statusOptions}
          value={values.Status || ''}
          formikProps={formikProps}
        />
      </Box>
    </Box>
  );
};

export default withRBAC(AddLocationForm, ['WorkLocation']);
