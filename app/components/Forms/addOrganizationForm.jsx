import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import { withRBAC } from '../HOC/withRBAC';
import StyledAutocomplete from '../Select/Autocomplete';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';

const AddOrganizationForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}) => {
  const dispatch = useDispatch();
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { resources } = useSelector(state => state.resources);
  const [readOnly, setReadOnly] = useState(true);
  const { formType } = useSelector(state => state.globalDialog.formState);

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
    setReadOnly(
      (formType === 'edit_organization' && !permissions['Organization']?.u) ||
        (formType === 'add_organization' && !permissions['Organization']?.c)
    );
    if (!resources.length) {
      dispatch({ type: FETCH_ALL_RESOURCES_DETAIL, payload: {} });
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      const normalizedData = {
        Id: initialData.id || '',
        Name: initialData.Name || '',
        Status: initialData.Status || 'Active',
        // add other fields as needed
      };
      setFormValue(normalizedData);
      resetForm({ values: normalizedData });
      setTouched({});
    }
  }, [initialData, resources]);

  return (
    <Box>
      <StyledLabel>
        Organization Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          disabled={readOnly}
          readOnly={readOnly}
          name="Name"
          placeholder="Enter Organization Name"
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

      <Box sx={{ flex: 1 }}>
        <StyledLabel>
          Status <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledAutocomplete
          disabled={readOnly}
          name="Status"
          label="Status"
          placeholder="Select"
          options={statusOptions}
          value={values.Status || ''}
          formikProps={formikProps}
          required
          FormHelperTextProps={{
            style: { marginLeft: 0, marginTop: 4 },
          }}
        />
      </Box>
    </Box>
  );
};

export default withRBAC(AddOrganizationForm, ['Organization']);
