'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  IconButton,
  TextField,
  styled,
  Checkbox,
} from '@mui/material';
import { X, Plus } from 'lucide-react';
import StyledLabel from '../Label/StyledLabel';
import CustomSelect from '../Select/CustomSelect';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useSelector } from 'react-redux';
import { StyledInput } from '../Input/StyledInput';
import MultiSelectWithChips from '../Select/MultiSelectWithChipSmaller';
import { addWeeks, format, startOfWeek, subWeeks } from 'date-fns';

const NameViewForm = ({ formikProps, setFormValue }) => {
  const { values, handleChange, handleBlur, setFieldValue, errors, touched } =
    formikProps;
  const { initialData } = useSelector(state => state.globalDialog.formState);

  // Error display helper
  const showError = fieldName => {
    return touched[fieldName] && errors[fieldName] ? (
      <Typography
        color="error"
        sx={{
          fontSize: '12px',
          mt: 0.5,
          fontFamily: 'Open Sans',
        }}
      >
        {errors[fieldName]}
      </Typography>
    ) : null;
  };

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...(initialData?.id !== undefined && { id: initialData.id }), // Conditional property, not required for render.
        ...(initialData?.groupBy !== undefined && {
          groupBy: initialData.groupBy,
        }),
        ...(initialData?.showBy !== undefined && {
          showBy: initialData.showBy,
        }),
        ...(initialData?.dateRangeType !== undefined && {
          dateRangeType: initialData.dateRangeType,
        }),
        ...(initialData?.dynamicDateRangeAdd !== undefined && {
          dynamicDateRangeAdd: initialData.dynamicDateRangeAdd,
        }),
        ...(initialData?.dynamicDateRangeSubtract !== undefined && {
          dynamicDateRangeSubtract: initialData.dynamicDateRangeSubtract,
        }),
        ...(initialData?.startDate !== undefined && {
          startDate: initialData.startDate,
        }),
        ...(initialData?.endDate !== undefined && {
          endDate: initialData.endDate,
        }),
        ...(initialData?.showColumns !== undefined && {
          showColumns: initialData.showColumns,
        }),
        ...(initialData?.filters !== undefined && {
          filters: initialData.filters,
        }),
        ...(initialData?.calendarBy !== undefined && {
          calendarBy: initialData.calendarBy,
        }),
        name: initialData?.name || '',
        description: initialData?.description || '',
        isDefault: initialData?.isDefault || false,
      };
      setFormValue(formData);
      formikProps.resetForm({ values: formData });
      formikProps.setTouched({});
    }
  }, [initialData]);

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Name</StyledLabel>
        <StyledInput
          as={TextField}
          name="name"
          value={values.name || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name && Boolean(errors.name)}
          helperText={touched.name && formikProps.errors.name}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Description</StyledLabel>
        <StyledInput
          as={TextField}
          name="description"
          value={values.description || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.description && Boolean(errors.description)}
          helperText={touched.description && formikProps.errors.description}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pb: 2,
        }}
      >
        <FormControlLabel
          sx={{ mr: 0 }}
          control={
            <Checkbox
              name="isDefault"
              checked={values.isDefault || false}
              onChange={handleChange}
              color="primary"
              sx={{ m: 0 }}
            />
          }
          label=""
        />
        <StyledLabel sx={{ pt: 0.5, ml: 0, pl: 0 }}>Set as Default</StyledLabel>
      </Box>
    </Box>
  );
};

export default NameViewForm;
