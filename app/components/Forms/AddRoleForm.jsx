'use client';

import { useEffect, useState } from 'react';
import { TextField, Box, Autocomplete } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import {
  StyledCommentInput,
  StyledFormInfoText,
  StyledInput,
} from '../Input/StyledInput';
import { useSelector, useDispatch } from 'react-redux';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import { showToast } from '@/app/redux/reducers/toastReducer';

const AddRoleForm = ({ formikProps, setFormValue }) => {
  const { values, handleChange, handleBlur, setFieldValue,touched,errors} = formikProps;
  const { projects } = useSelector(state => state.projects);
  const { resources } = useSelector(state => state.resources);
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const dispatch = useDispatch();
  const [selectStatus, setSelectStatus] = useState('Active');
  const [roleName, setRoleName] = useState('');

  const commonAutocompleteStyles = {
    '& .MuiInputBase-root': { fontSize: '12px' },
    '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
    '& input': { fontSize: '12px' },
    '& .MuiAutocomplete-popper': { fontSize: '12px' },
    '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
  };

  const commonSlotProps = {
    popper: {
      modifiers: [
        {
          name: 'preventOverflow',
          options: {
            boundary: 'window',
          },
        },
      ],
    },
    paper: {
      sx: {
        fontSize: '12px',
      },
    },
  };

  const handleStatusChange = (event, newValue) => {
    if (newValue) {
      setFieldValue('Status', newValue);
    }
  };

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Role <span style={{ color: 'red' }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          placeholder="Enter Role"
          fullWidth
          onChange={e => {
            handleChange(e);
            setRoleName(e.target.value);
          }}
          onBlur={handleBlur}
          value={values.Name || ''}
          error={touched.Name && Boolean(errors.Name)}
          helperText={touched.Name && errors.Name}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>Status</StyledLabel>
        <Autocomplete
          disableClearable
          sx={commonAutocompleteStyles}
          size="small"
          options={['Active']}
          getOptionLabel={option => option || ''}
          value={selectStatus}
          onChange={handleStatusChange}
          slotProps={commonSlotProps}
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Select Status"
              variant="outlined"
              error={
                formikProps.touched.Resource &&
                Boolean(formikProps.errors.Resource)
              }
              helperText={
                formikProps.touched.Resource && formikProps.errors.Resource
              }
              FormHelperTextProps={{
                sx: {
                  fontSize: '12px',
                  textAlign: 'left',
                  marginLeft: '0px',
                },
              }}
            />
          )}
        />
      </Box>
    </Box>
  );
};

export default AddRoleForm;
