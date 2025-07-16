'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Resource, Role } from '@/app/types';
import { FormikProps } from 'formik';

interface FormValues {
  Assignee: Resource | null;
  Role: string;
  Status: string;
  [key: string]: any;
}

interface AssignRoleFormProps {
  formikProps: FormikProps<FormValues>;
}

const AssignRoleForm = ({ formikProps }: AssignRoleFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { resources } = useSelector((state: any) => state.resources);
  const roles: Role[] = useSelector((state: any) => state.rbac.roles);

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
          Select User <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={resources.result}
          getOptionLabel={(option: Resource) =>
            option.FullName || option.FirstName || ''
          }
          value={values.Assignee || null}
          onChange={handleAutocompleteChange('Assignee')}
          isOptionEqualToValue={(option, value) =>
            option?.Email === value?.Email
          }
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select User"
              variant="outlined"
              error={touched.Assignee && Boolean(errors.Assignee)}
              helperText={touched.Assignee && errors.Assignee}
              FormHelperTextProps={{
                sx: { fontSize: '12px', textAlign: 'left', ml: 0 },
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          {' '}
          Select Role <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={roles.map(r => r.Name)}
          value={values.Role || ''}
          onChange={handleAutocompleteChange('Role')}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Role"
              variant="outlined"
              error={touched.Role && Boolean(errors.Role)}
              helperText={touched.Role && errors.Role}
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

export default AssignRoleForm;
