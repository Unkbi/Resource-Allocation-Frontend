'use client';

import { useEffect, useState } from 'react';
import { TextField, Box, Autocomplete } from '@mui/material';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import { useSelector, useDispatch } from 'react-redux';
import { FormikProps } from 'formik';
import { RootState } from '@/app/redux/store';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

interface FormValues {
  Name: string;
  [key: string]: any;
}

interface AddLocationGroupFormProps {
  formikProps: FormikProps<FormValues>;
  setFormValue: (value: FormValues) => void;
  permissions: Record<string, CrudPermissions>;
}

const AddLocationGroupForm = ({
  formikProps,
  setFormValue,
  permissions,
}: AddLocationGroupFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { initialData, formType } = useSelector(
    (state: RootState) => state.globalDialog.formState
  );
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_location_group' &&
        !permissions['WorkLocationGroup']?.u) ||
        (formType === 'add_location_group' &&
          !permissions['WorkLocationGroup']?.c)
    );
  }, []);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        Name: initialData.Name || '',
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, []);

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Location Group Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          disabled={readOnly}
          readOnly={readOnly}
          as={TextField}
          name="Name"
          placeholder="Enter Name"
          fullWidth
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(e);
            setFormValue({ ...values, Name: e.target.value });
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
    </Box>
  );
};

export default withRBAC(AddLocationGroupForm, ['WorkLocationGroup']);
