'use client';

import { Box, TextField, Autocomplete } from '@mui/material';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Role, UserRbac, } from '@/app/types';
import { FormikProps } from 'formik';
import { GET_USER } from '@/app/redux/actions/rbacActions';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

interface FormValues {
  Assignee: UserRbac | null;
  Role: string;
  Status: string;
  [key: string]: any;
}

interface AssignRoleFormProps {
  formikProps: FormikProps<FormValues>;
  setFormValue?: (values: FormValues) => void;
}

const AssignRoleForm = ({ formikProps , setFormValue = () => {}}: AssignRoleFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { initialData } = useSelector((state: any) => state.globalDialog.formState);
  const roles: Role[] = useSelector((state: any) => state.rbac.roles);
  const user: UserRbac[] = useSelector((state: any) => state.rbac.user) 
  const dispatch = useDispatch();
   const roleAssignments = useSelector(
    (state: any) => state.rbac.roleAssignments
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
    const userId = initialData.User?.replace("agentlang.auth$User/", "");
    const roleName = initialData.Role?.split("/")[1] || initialData.Role;
    const assigneeUser = user.find((u: UserRbac) => u.id === userId) || null;
    const rowData: FormValues = {
      Assignee: assigneeUser,
      Role: roleName || '',
      Status: initialData.Status || 'Active',
    };
    setFormValue(rowData);
    formikProps.resetForm({ values: rowData });
    formikProps.setTouched({});
  }
}, [initialData, user]);


    useEffect(() => {
    if (!user || user.length === 0) {
    dispatch({ type: GET_USER });
    }
    },[dispatch,user]);
  const handleAutocompleteChange =
    (field: string) => (_event: any, newValue: any) => {
      setFieldValue(field, newValue || '');
    };

    const assignedUserIds = new Set(roleAssignments.map((r :any) => r.User.replace("agentlang.auth$User/", ""))); 
    const filteredUsers = user.filter(u => !assignedUserIds.has(u.id));

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Select User <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          size="small"
          options={filteredUsers}
          getOptionLabel={(option: UserRbac) => {
          const name = [option?.firstName, option?.lastName].filter(Boolean).join(' ');
          return name || option?.email || '';
           }}
          value={values.Assignee || null}
          onChange={handleAutocompleteChange('Assignee')}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
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
          options={roles.map(r => r.name)}
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
