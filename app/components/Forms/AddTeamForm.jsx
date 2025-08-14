import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import StyledAutocomplete from '../Select/Autocomplete';

const AddTeamForm = ({ formikProps, setFormValue = () => {} }) => {
  const dispatch = useDispatch();
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { resources } = useSelector(state => state.resources);

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

  const resourceListOptions =
    resources?.result?.map(resource => ({
      value: resource.__path__,
      label: resource.FullName,
    })) || [];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  useEffect(() => {
    if (!resources || !resources?.result) {
      dispatch(fetchAllResources());
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        Name: initialData.Team || '',
        AllocationManager:
          resources.result.find(
            res => res.__path__ === initialData.AllocationManager
          )?.__path__ || '', 
        Status: initialData.Status || 'Active',
      };

      setFormValue(rowData);
      resetForm({ values: rowData });
      setTouched({});
    }
  }, [initialData, resources]);

  return (
    <Box>
      <StyledLabel>
        Team Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="Name"
          placeholder="Enter team name"
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

      <Box sx={{ pb: 2 }}>
        <StyledLabel sx={{ flex: 1 }}>
          Team Allocation Manager
        </StyledLabel>
        <StyledAutocomplete
          name="AllocationManager"
          label="Team Allocation Manager"
          options={resourceListOptions}
          value={values.AllocationManager || ''}
          formikProps={formikProps} 
          fullWidth
        />
      </Box>

      <Box sx={{ flex: 1 }}>
        <StyledLabel>
          Status <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          name="Status"
          label="Status"
          options={statusOptions}
          value={values.Status || ''}
          formikProps={formikProps}
          fullWidth
        />
      </Box>
    </Box>
  );
};

export default AddTeamForm;