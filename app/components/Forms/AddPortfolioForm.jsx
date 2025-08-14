import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';
import { FETCH_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import { MuiColorInput } from 'mui-color-input';
import StyledAutocomplete from '../Select/Autocomplete';

const AddPortfolioForm = ({ formikProps, setFormValue = () => {} }) => {
  const dispatch = useDispatch();
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { projects } = useSelector(state => state.projects);

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
    dispatch({ type: FETCH_PORTFOLIOS });
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        Name: initialData.Name || '',
        Description: initialData.Description || '',
        Status: initialData.Status || 'Active',
        SidebarColor: initialData.SidebarColor || '#000000',
      };

      setFormValue(rowData);
      resetForm({ values: rowData });
      setTouched({});
    }
  }, [initialData, projects]);

  return (
    <Box>
      <StyledLabel>
        {PORTFOLIO_DISPLAY_NAME} Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="Name"
          placeholder={`Enter ${PORTFOLIO_DISPLAY_NAME.toLowerCase()} name`}
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
        <StyledAutocomplete
          name="Status"
          label="Status"
          placeholder="Select status"
          options={statusOptions}
          value={values.Status || ''}
          formikProps={formikProps}
          fullWidth
        />
      </Box>

      <StyledLabel>Description</StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="Description"
          placeholder="Enter Description "
          value={values.Description || ''}
          onChange={handleChange}
          onBlur={e => {
            const trimmed = e.target.value.trim();
            setFieldValue('Description', trimmed);
            handleBlur(e);
          }}
          error={touched.Description && Boolean(errors.Description)}
          helperText={touched.Description && errors.Description}
        />
      </Box>
      <StyledLabel>Sidebar Color</StyledLabel>
      <Box sx={{ pb: 2 }}>
        <MuiColorInput
          name="SidebarColor"
          format="hex"
          value={values.SidebarColor}
          onChange={e => {
            setFieldValue('SidebarColor', e);
          }}
          size="small"
          sx={{
            width: '100%',
            '& .MuiColorInput-input': {
              width: '100%',
              height: '32px',
              borderRadius: '4px',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
            },
            '& .MuiInputBase-input': {
              fontSize: '14px',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default AddPortfolioForm;
