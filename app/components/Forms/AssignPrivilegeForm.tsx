'use client';

import { Box, TextField, Autocomplete, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Privilege, PrivilegeAssignment, Resource, Role } from '@/app/types';
import { FormikProps } from 'formik';
import { useEffect, useState } from 'react';
import { FETCH_PRIVILEGES } from '@/app/redux/actions/rbacActions';
import { useDispatch } from 'react-redux';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

interface AssignPrivilegeFormValues {
  Role: string;
  Permission: string;
}

interface AssignPrivilegeFormProps {
  formikProps: FormikProps<AssignPrivilegeFormValues>;
  setFormValue?: (values: AssignPrivilegeFormValues) => void;
  permissions: Record<string, CrudPermissions>;
}

const AssignPrivilegeForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}: AssignPrivilegeFormProps) => {
  const theme = useTheme();
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { initialData, formType } = useSelector(
    (state: any) => state.globalDialog.formState
  );
  const dispatch = useDispatch();
  const roles: Role[] = useSelector((state: any) => state.rbac.roles || []);
  const privileges: Privilege[] = useSelector(
    (state: any) => state.rbac.privileges || []
  );
  const privilegeAssignments: PrivilegeAssignment[] = useSelector(
    (state: any) => state.rbac.privilegeAssignments || []
  );
  const [readOnly, setReadOnly] = useState(true);
  const assignedPrivilegePaths = new Set(
    privilegeAssignments
      .filter(pa => pa.Role === values.Role)
      .map(pa => pa.Permission as string)
  );
  const availablePrivileges = privileges.filter(
    p => p.__path__ && !assignedPrivilegePaths.has(p.__path__)
  );

  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
    '& .Mui-disabled': {
      //@ts-ignore
      backgroundColor: theme.palette.readonly.main, // This is a custom color in the theme
      cursor: 'default',
    },
    '& .Mui-disabled .MuiInputBase-input': {
      color: '#6B7280 !important',
      //@ts-ignore
      WebkitTextFillColor: theme.palette.readonly.contrastText, // This is a custom color in the theme
    },
  };

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_privilege_assignment' &&
        !permissions['Permission']?.u) ||
        (formType === 'add_privilege_assignment' &&
          !permissions['Permission']?.c)
    );
  }, []);

  useEffect(() => {
    if (initialData) {
      const rowData: AssignPrivilegeFormValues = {
        Role: initialData.Role || '',
        Permission: initialData.Permission || '',
      };
      setFormValue(rowData);
      formikProps.resetForm({ values: rowData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  useEffect(() => {
    if (!privileges || privileges.length === 0) {
      dispatch({ type: FETCH_PRIVILEGES });
    }
  }, [privileges]);

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Role <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          disabled={readOnly}
          sx={commonAutocompleteStyles}
          size="small"
          options={roles}
          getOptionLabel={(option: Role) => option.name}
          value={roles.find(r => r.__path__ === values.Role) || null}
          onChange={(_event, newValue) => {
            const newRolePath = newValue?.__path__ || '';
            setFieldValue('Role', newRolePath);
            if (
              newRolePath &&
              values.Permission &&
              privilegeAssignments.some(
                pa =>
                  pa.Role === newRolePath && pa.Permission === values.Permission
              )
            ) {
              setFieldValue('Permission', '');
            }
          }}
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
          Privilege <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          disabled={readOnly}
          sx={commonAutocompleteStyles}
          size="small"
          options={availablePrivileges}
          getOptionLabel={(option: Privilege) => {
            const name = option?.id || '';
            const prefix = 'agentlang.auth$Permission';
            return name.startsWith(prefix) ? name.slice(prefix.length) : name;
          }}
          value={privileges.find(p => p.__path__ === values.Permission) || null}
          onChange={(_event, newValue) =>
            setFieldValue('Permission', newValue?.__path__ || '')
          }
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Privilege"
              variant="outlined"
              error={touched.Permission && Boolean(errors.Permission)}
              helperText={
                touched.Permission && typeof errors.Permission === 'string'
                  ? errors.Permission
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

export default withRBAC(AssignPrivilegeForm, ['Permission']);
