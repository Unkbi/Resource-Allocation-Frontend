import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import { FormikProps } from 'formik';
import { UserFormValues } from '@/app/types';
import StyledAutocomplete from '../Select/Autocomplete';
import { FETCH_ROLES } from '@/app/redux/actions/rbacActions';

interface AddUserFormProps {
  formikProps: FormikProps<UserFormValues>;
  setFormValue?: (values: UserFormValues) => void;
}

const AddUserForm = ({
  formikProps,
  setFormValue = () => {},
}: AddUserFormProps) => {
  const {
    values,
    handleChange,
    handleBlur,
    setFieldValue,
    touched,
    setTouched,
    resetForm,
    errors,
  } = formikProps;
  const dispatch = useDispatch<any>();
  const { initialData } = useSelector(
    (state: any) => state.globalDialog.formState || {}
  );
  // const { resources } = useSelector((state: any) => state.resources || {});
  const {roles} = useSelector((state:any)=> state.rbac || {})
  const seenValues = new Set<string>();

  const roleOptions: { value: string; label: string; id: string }[] = (
    roles || []
  )
    .map((role: any) => ({
      value: role.name,
      label: role.name,
      id: role.name,
    }))
    .filter((option: any) => {
      if (seenValues.has(option.value)) return false;
      seenValues.add(option.value);
      return true;
    });

  useEffect(() => {
    if (initialData) {
      const [firstName, lastName] = initialData?.Name?.split(' ') || [];
      const obj = {
        FirstName: firstName || '',
        LastName: lastName || '',
        Email: initialData?.email || '',
        Role: initialData?.role || 'CEO',
        sendActivationEmail: initialData?.sendActivationEmail || false,
      };
      setFormValue(obj);
      resetForm({ values: obj });
      setTouched({});
    }
  }, [initialData]);

  useEffect(() => {
    if (!roles || roles.length === 0) {
      dispatch({type: FETCH_ROLES});
    }
  }, [dispatch, roles]);

  return (
    <Box>
      <StyledLabel>
        First Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="firstName"
          placeholder="Enter First Name"
          value={values?.FirstName || ''}
          onChange={(e: any) => {
            handleChange(e);
            setFieldValue('FirstName', e.target.value);
          }}
          onBlur={handleBlur}
          error={touched?.FirstName && Boolean(errors?.FirstName)}
          helperText={touched?.FirstName && errors?.FirstName}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Last Name <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          name="lastName"
          placeholder="Enter Last Name"
          value={values?.LastName || ''}
          onChange={(e: any) => {
            handleChange(e);
            setFieldValue('LastName', e.target.value);
          }}
          onBlur={handleBlur}
          error={touched?.LastName && Boolean(errors?.LastName)}
          helperText={touched?.LastName && errors?.LastName}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Email-Id <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          name="email"
          placeholder="Enter Email"
          value={values?.Email || ''}
          onChange={(e: any) => {
            handleChange(e);
            setFieldValue('Email', e.target.value);
          }}
          onBlur={handleBlur}
          error={touched?.Email && Boolean(errors?.Email)}
          helperText={touched?.Email && errors?.Email}
        />
      </Box>

      <Box sx={{ flex: 1 }}>
        <StyledLabel>
          Role Assignment <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          name="Role"
          label="Role"
          placeholder="Select Role"
          value={values.Role || ''}
          options={roleOptions}
          required
          formikProps={formikProps}
          fullWidth
        />
      </Box>

      <Box sx={{ pb: 2, mt: 2, display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id="sendActivationEmail"
          checked={values.sendActivationEmail || false}
          onChange={(e) => {
        setFieldValue('sendActivationEmail', e.target.checked);
          }}
          style={{
        marginRight: '8px',
        width: '18px',
        height: '18px',
        accentColor: '#1976d2'
          }}
        />
        <label 
          htmlFor="sendActivationEmail" 
          style={{ 
        fontSize: '14px', 
        color: '#666',
        cursor: 'pointer'
          }}
        >
          Send account activation email to this user.
        </label>
      </Box>
    </Box>
  );
};

export default AddUserForm;
