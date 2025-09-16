import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomSelect from '../Select/CustomSelect';
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';
import { FETCH_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import { MuiColorInput } from 'mui-color-input';
import StyledAutocomplete from '../Select/Autocomplete';
import { withRBAC } from '../HOC/withRBAC';

const AddPortfolioForm = ({
  formikProps,
  setFormValue = () => {},
  permissions,
}) => {
  const dispatch = useDispatch();
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { projects } = useSelector(state => state.projects);
  const { formType } = useSelector(state => state.globalDialog.formState);
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

  useEffect(() => {
    setReadOnly(
      (formType === 'edit_portfolio' && !permissions['Portfolio']?.u) ||
        (formType === 'add_portfolio' && !permissions['Portfolio']?.c)
    );
  }, [readOnly]);

  return (
    <Box>
      <StyledLabel>
        {PORTFOLIO_DISPLAY_NAME} Name <span style={{ color: 'red' }}>*</span>
      </StyledLabel>
      <Box sx={{ pb: 2 }}>
        <StyledInput
          name="Name"
          placeholder={`Enter ${PORTFOLIO_DISPLAY_NAME.toLowerCase()} name`}
          disabled={readOnly}
          readOnly={readOnly}
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
          disabled={readOnly}
          readOnly={readOnly}
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
          disabled={readOnly}
          readOnly={readOnly}
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
          sx={theme => ({
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
            '&.Mui-disabled': {
              //@ts-ignore
              backgroundColor: theme.palette.disabledField?.main,
              '& .MuiInputBase-input': {
                borderColor: 'rgba(214, 220, 225, 1) !important',
                //@ts-ignore
                color: theme.palette.disabledField?.contrastText,
                //@ts-ignore
                WebkitTextFillColor: theme.palette.disabledField?.contrastText,
              },
            },
            ...(readOnly && {
              //@ts-ignore
              backgroundColor: theme.palette.readonly?.main,
              '& .MuiInputBase-input': {
                borderColor: 'rgba(214, 220, 225, 1) !important',
                //@ts-ignore
                color: theme.palette.readonly?.contrastText,
                //@ts-ignore
                WebkitTextFillColor: theme.palette.readonly?.contrastText,
              },
            }),
          })}
        />
      </Box>
    </Box>
  );
};

export default withRBAC(AddPortfolioForm, ['Portfolio']);
