'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
export interface ProjectTypeGroup {
  Name: string;
}

import { FormikProps } from 'formik';
import { StyledInput } from '../Input/StyledInput';
import { RootState } from '@/app/redux/store';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

interface AddProjectTypesGroupForm {
  formikProps: FormikProps<ProjectTypeGroup>;
  setFormValue: (value: ProjectTypeGroup) => void;
  permissions: Record<string, CrudPermissions>;
}

const AddProjectTypesGroupForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}: AddProjectTypesGroupForm) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { initialData } = useSelector(
    (state: any) => state.globalDialog.formState
  );
  const { formType } = useSelector(
    (state: RootState) => state.globalDialog.formState
  );
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_project_type_group' &&
        !permissions['ProjectTypeGroup']?.u) ||
        (formType === 'add_project_type_group' &&
          !permissions['ProjectTypeGroup']?.c)
    );
  }, []);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        Name: initialData.Name,
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project Category Name <span style={{ color: 'red' }}>*</span>
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
    </Box>
  );
};

export default withRBAC(AddProjectTypesGroupForm, ['ProjectTypeGroup']);
