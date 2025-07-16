'use client';

import {
  Box,
  TextField,
  Autocomplete,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import { stat } from 'fs';

type ActionType = 'Create' | 'Read' | 'Update' | 'Delete';

interface PrivilegeFormValues {
  Name: string;
  Resource: string;
  Actions: Record<ActionType, boolean>;
}
interface AddPrivilegeFormProps {
  formikProps: FormikProps<PrivilegeFormValues>;
  setFormValue?: (values: PrivilegeFormValues) => void;
}

const AddPrivilegeForm = ({
  formikProps,
  setFormValue = () => {},
}: AddPrivilegeFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, errors, touched } =
    formikProps;
  const privileges = useSelector((state: any) => state.rbac.privileges);
  const [privilegeName, setPrivilegeName] = useState('');
  const { initialData } = useSelector((state: any) => state.globalDialog.formState);

  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

useEffect(() => {
  if (initialData) {
    const rowData: PrivilegeFormValues = {
      Name: initialData.Name || '',
      Resource: Array.isArray(initialData.Resource)
        ? initialData.Resource[0] || ''
        : initialData.Resource || '',
      Actions: {
        Create: initialData.Actions?.Create || false,
        Read: initialData.Actions?.Read || false,
        Update: initialData.Actions?.Update || false,
        Delete: initialData.Actions?.Delete || false,
      },
    };
    setFormValue(rowData);
    formikProps.resetForm({ values: rowData });
    formikProps.setTouched({});
  }
}, [initialData]);
  
  const handleAutocompleteChange =
    (field: string) => (_event: any, newValue: any) => {
      setFieldValue(field, newValue || '');
    };

  const actionList: ActionType[] = ['Create', 'Read', 'Update', 'Delete'];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Privilege Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          placeholder="Enter Privilege Name"
          value={values.Name || ''}
          onChange={e => {
            handleChange(e);
            setPrivilegeName(e.target.value);
          }}
          onBlur={handleBlur}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Entity <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={[
            ...new Set(
              privileges.map((r: any) =>
                Array.isArray(r.Resource) ? r.Resource[0] : r.Resource
              )
            ),
          ]}
          // options={[...new Set(privileges.map((r: any) => r.Resource[0]))]}
          //   options={[...new Set(privileges.map((r: any) => r.Resource))]}
          //   getOptionLabel={(option: string) => option}
          value={values.Resource || ''}
          onChange={handleAutocompleteChange('Resource')}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Entity"
              variant="outlined"
              error={touched.Resource && Boolean(errors.Resource)}
              helperText={touched.Resource && errors.Resource}
              FormHelperTextProps={{
                sx: { fontSize: '12px', textAlign: 'left', ml: 0 },
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel sx={{ px: 0.3 }}>
          Actions (CRUD) <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <FormGroup>
          {actionList.map(action => (
            <FormControlLabel
              key={action}
              control={
                <Checkbox
                  size="small"
                  name={`Actions.${action}`}
                  checked={values.Actions?.[action] || false}
                  onChange={e =>
                    setFieldValue(`Actions.${action}`, e.target.checked)
                  }
                  onBlur={() => formikProps.setFieldTouched('Actions', true)}
                />
              }
              label={action}
            />
          ))}
        </FormGroup>

        {touched.Actions && typeof errors.Actions === 'string' && (
          <Typography sx={{ color: '#B44536', fontSize: '12px', mt: 0.5 }}>
            {errors.Actions}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AddPrivilegeForm;
