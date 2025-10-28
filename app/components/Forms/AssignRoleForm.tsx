'use client';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { Role, UserRbac } from '@/app/types';
import { FormikProps } from 'formik';
import { GET_USER } from '@/app/redux/actions/rbacActions';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';
import StyledAutocomplete from '../Select/Autocomplete';
import { RootState } from '@/app/redux/store';

interface FormValues {
  Assignee: string;
  Role: string;
  Status: string;
  [key: string]: any;
}

interface AssignRoleFormProps {
  formikProps: FormikProps<FormValues>;
  setFormValue?: (values: FormValues) => void;
  permissions: Record<string, CrudPermissions>;
}

const AssignRoleForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}: AssignRoleFormProps) => {
  const { values, handleChange, handleBlur, setFieldValue, touched, errors } =
    formikProps;
  const { initialData, formType } = useSelector(
    (state: RootState) => state.globalDialog.formState
  );
  const roles: Role[] = useSelector((state: RootState) => state.rbac.roles);
  const user: UserRbac[] = useSelector((state: any) => state.rbac.user);
  const dispatch = useDispatch();
  const roleAssignments = useSelector(
    (state: RootState) => state.rbac.roleAssignments
  );
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_role_assignment' && !permissions['Role']?.u) ||
        (formType === 'add_role_assignment' && !permissions['Role']?.c)
    );
  }, []);

  useEffect(() => {
    if (initialData) {
      const userId = initialData.User?.replace('agentlang.auth$User/', '');
      const rowData: FormValues = {
        Assignee: userId || '',
        Role: initialData.Role || '',
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
  }, [dispatch, user]);

  const assignedUserIds = new Set(
    roleAssignments.map((r: any) => r.User.replace('agentlang.auth$User/', ''))
  );
  const filteredUsers = user.filter(
    u =>
      u.id === initialData.User?.replace('agentlang.auth$User/', '') ||
      !assignedUserIds.has(u.id)
  );

  const userNameOptions =
    filteredUsers?.map((u: UserRbac) => {
      const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ');
      return {
        value: u.id,
        label: name || u?.email || '',
      };
    }) || [];

  const roleNameOptions =
    roles?.map((role: Role) => ({
      value: role.name,
      label: role.name ?? '',
    })) || [];

  const statusOptions = [{ value: 'Active', label: 'Active' }];

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Select User <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          name="Assignee"
          label="Select User"
          options={userNameOptions}
          value={values.Assignee || ''}
          formikProps={formikProps}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          {' '}
          Select Role <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          name="Role"
          label="Select Role"
          options={roleNameOptions}
          value={values.Role || ''}
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

export default withRBAC(AssignRoleForm, ['Role']);
