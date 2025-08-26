import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import { FormikProps } from 'formik';
import { UserFormValues } from '@/app/types';

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
  const { resources } = useSelector((state: any) => state.resources || {});
  const seenValues = new Set<string>();
  
  const roleOptions: { value: string; label: string; id: string }[] = (
    resources?.result || []
  )
    .map((resource: any) => ({
      value: resource.Role,
      label: resource.Role,
      id: resource.Id,
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
    if (!resources || !resources?.result) {
      dispatch(fetchAllResources());
    }
  }, [dispatch, resources]);

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
          onChange={e => {
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
          onChange={e => {
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
          onChange={e => {
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
        <CustomSelect
          name="role"
          options={roleOptions}
          value={values?.Role || ''}
          onChange={(e: any) => {
            handleChange(e);
            setFieldValue('Role', e.target.value);
          }}
          onBlur={handleBlur}
          width="100%"
          error={touched?.Role && Boolean(errors?.Role)}
          helperText={errors?.Role}
        />
      </Box>
    </Box>
  );
};

export default AddUserForm;
