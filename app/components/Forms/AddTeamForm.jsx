import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import StyledAutocomplete from '../Select/Autocomplete';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { withRBAC } from '../HOC/withRBAC';

const AddTeamForm = ({
  formType,
  formikProps,
  setFormValue = () => {},
  permissions,
}) => {
  const dispatch = useDispatch();
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { resources } = useSelector(state => state.resources);
  const [readOnly, setReadOnly] = useState(true);

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
    resources?.map(resource => ({
      value: resource.__path__,
      label: resource.FullName,
    })) || [];

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_team' && !permissions['Team']?.u) ||
        (formType === 'add_team' && !permissions['Team']?.c)
    );
    if (!resources) {
      dispatch({ type: FETCH_ALL_RESOURCES_DETAIL, payload: {} });
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        Name: initialData.Team || '',
        AllocationManager:
          resources?.find(res => res.__path__ === initialData.AllocationManager)
            ?.__path__ || '',
        Status: initialData.Status || 'Inactive',
      };

      setFormValue(rowData);
      resetForm({ values: rowData });
      setTouched({});
    }
  }, [initialData, resources]);

  const isEdit = Boolean(initialData && Object.keys(initialData).length > 0);

  useEffect(() => {
    if (!isEdit) {
      setFieldValue('Status', values.AllocationManager ? 'Active' : 'Inactive', false);
    }
  }, [values.AllocationManager, isEdit, setFieldValue]);

  return (
    <Box>
      <StyledLabel>
        Team Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          disabled={readOnly}
          readOnly={readOnly}
          name="Name"
          placeholder="Enter Team Name"
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
        <StyledLabel sx={{ flex: 1 }}>Team Allocation Manager</StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
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
          disabled={readOnly}
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

export default withRBAC(AddTeamForm, ['Team']);
