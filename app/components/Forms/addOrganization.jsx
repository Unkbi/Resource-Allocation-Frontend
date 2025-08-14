import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import { FETCH_ORGANISATIONS } from '@/app/redux/actions/organizationsAction'; 

const AddOrganizationForm = ({ formikProps, setFormValue = () => {} }) => {
  const dispatch = useDispatch();
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { organizations } = useSelector(state => state.organisations);
  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    setFieldValue,
    resetForm,
    setTouched,
  } = formikProps;

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  useEffect(() => {
    dispatch({ type: FETCH_ORGANISATIONS });
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        Name: initialData.Name || '',
        Status: initialData.Status || 'Active',
      };

      setFormValue(rowData);
      resetForm({ values: rowData });
      setTouched({});
    }
  }, [initialData]);

  return (
    <Box>
      <StyledLabel>
        Organization Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="Name"
          placeholder="Enter organization name"
          value={values.Name || ''}
          onChange={handleChange}
          onBlur={e => {
            const trimmed = e.target.value.trim();
            setFieldValue('Name', trimmed);
            handleBlur(e);
          }}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
        />
      </Box>

      <Box sx={{ flex: 1, pb: 2 }}>
        <StyledLabel>
          Status <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <CustomSelect
          name="Status"
          options={statusOptions}
          value={values.Status || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          width="100%"
          error={touched.Status && Boolean(errors.Status)}
          helperText={errors.Status}
        />
      </Box>
    </Box>
  );
};

export default AddOrganizationForm;
