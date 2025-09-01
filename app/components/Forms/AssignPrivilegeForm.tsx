'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Privilege, PrivilegeAssignment, Resource, Role } from '@/app/types';
import { FormikProps } from 'formik';
import { useEffect } from 'react';
import { FETCH_PRIVILEGES } from '@/app/redux/actions/rbacActions';
import { useDispatch } from 'react-redux';

interface AssignPrivilegeFormValues {
  Role: string;
  Privilege: string;
}

interface AssignPrivilegeFormProps {
  formikProps: FormikProps<AssignPrivilegeFormValues>;
  setFormValue?: (values: AssignPrivilegeFormValues) => void;
}

const AssignPrivilegeForm = ({
  formikProps,
  setFormValue = () => {},
}: AssignPrivilegeFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { initialData } = useSelector(
    (state: any) => state.globalDialog.formState
  );
  const dispatch = useDispatch();
  const roles: Role[] = useSelector((state: any) => state.rbac.roles || []);
  const privileges: Privilege[] = useSelector(
    (state: any) => state.rbac.privileges
  );

  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  useEffect(() => {
    if (initialData) {
      const rowData: AssignPrivilegeFormValues = {
        Role: initialData.Role || '',
        Privilege: initialData.Privilege || '',
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  useEffect(() => {
    if (!privileges || privileges.length === 0) {
       dispatch({ type: FETCH_PRIVILEGES});
    }
  }, [privileges]);

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Role <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={roles}
          getOptionLabel={(option: Role) => option.name}
          value={roles.find(r => r.name === values.Role) || null}
          onChange={(_event, newValue) =>
            setFieldValue('Role', newValue?.name || '')
          }
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
        <StyledLabel>
          {' '}
          Privilege <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={privileges}
          getOptionLabel={(option: Privilege) => {
            const name = option?.id || '';
            const prefix = 'priv_ResourceAllocation.Core_';
            return name.startsWith(prefix) ? name.slice(prefix.length) : name;
          }}
          value={privileges.find(p => p.id === values.Privilege) || null}
          onChange={(_event, newValue) =>
            setFieldValue('Privilege', newValue?.id || '')
          }
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Privilege"
              variant="outlined"
              error={touched.Privilege && Boolean(errors.Privilege)}
              helperText={
                touched.Privilege && typeof errors.Privilege === 'string'
                  ? errors.Privilege
                  : undefined
              }
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

export default AssignPrivilegeForm;
