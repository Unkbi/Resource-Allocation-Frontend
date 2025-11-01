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
  setFormValue = () => { },
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
  const { roles } = useSelector((state: any) => state.rbac || {})
  const seenValues = new Set<string>();
  const [showMessage, setShowMessage] = React.useState(true);
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
      };
      setFormValue(obj);
      resetForm({ values: obj });
      setTouched({});
    }
  }, [initialData]);

  useEffect(() => {
    if (!roles || roles.length === 0) {
      dispatch({ type: FETCH_ROLES });
    }
  }, [dispatch, roles]);

  return (
    <Box>
      <StyledLabel>
        First Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="FirstName"
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
          name="LastName"
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
          name="Email"
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 1,
        }}
      >
        <img src='/images/icons/ErrorOutline.svg' alt='Error Icon' style={{ width: 18, height: 18, marginRight: 8 }} />
        <StyledLabel sx={{ pb: 0, ml: 0, pl: 0, color: '#555555', fontWeight: 400 }}>
          Send account activation email to this user
        </StyledLabel>
      </Box>

      <Box sx={{
        display: showMessage ? 'block' : 'none',
        mt: 2,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        position: 'relative'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1
        }}>
          <img
            src="/images/icons/ErrorIcon.svg"
            alt="Error"
            style={{
              width: 20,
              height: 20,
              marginTop: 2,
              flexShrink: 0
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{
              fontWeight: 500,
              fontSize: '14px',
              color: '#030712',
              mb: 0.5
            }}>
              Important Message
            </Box>
            <Box sx={{
              fontSize: '12px',
              color: '#030712',
              fontWeight: 400,
              lineHeight: 1.4
            }}>
              The interface restricts a user to a single role at any given time.<br />
              Assign user roles through this interface; permissions are managed by RBAC.
            </Box>
          </Box>
          <Box
            sx={{
              cursor: 'pointer',
              color: '#666',
              fontSize: '18px',
              fontWeight: 'bold',
              lineHeight: 1,
              '&:hover': {
                color: '#030712'
              }
            }}
            onClick={() => setShowMessage(false)}
          >
            ×
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddUserForm;
