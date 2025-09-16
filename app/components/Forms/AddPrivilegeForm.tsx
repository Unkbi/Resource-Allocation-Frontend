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
import { StyledFormHelperText, StyledInput } from '../Input/StyledInput';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { FormikProps } from 'formik';

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
  const [privilegeName, setPrivilegeName] = useState('');
  const { initialData } = useSelector(
    (state: any) => state.globalDialog.formState
  );
  const meta = useSelector((state: any) => state.rbac.meta);

  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  useEffect(() => {
    if (initialData) {
      const actionObject: Record<ActionType, boolean> = {
        Create: initialData.c ?? false,
        Read:   initialData.r ?? false,
        Update: initialData.u ?? false,
        Delete: initialData.d ?? false,
      };

      const rowData: PrivilegeFormValues = {
        Name: initialData.id || '',
        Resource: Array.isArray(initialData.resourceFqName)
          ? initialData.resourceFqName[0] || ''
          : initialData.resourceFqName || '',
        Actions: actionObject,
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
  const actionError =
    formikProps.touched.Actions &&
    typeof formikProps.errors.Actions === 'string'
      ? formikProps.errors.Actions
      : undefined;

  const resourceEntities = meta?.entities?.Resource ?? [];
  const authEntities = meta?.entities?.['agentlang.auth'] ?? [];
  const allEntities = [...resourceEntities, ...authEntities];
  const resourceOptions: string[] = allEntities.map((entity: any) => entity.fqName);

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
          options={resourceOptions}
          getOptionLabel={(option: string) =>
            option?.split('/').length >= 2 ? option?.split('/')[1] : option
          }
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
        {actionError && (
          <StyledFormHelperText
            sx={{
              marginLeft: '3px',
              mt: 0.5,
            }}
            error
          >
            {actionError}
          </StyledFormHelperText>
        )}
      </Box>
    </Box>
  );
};

export default AddPrivilegeForm;
