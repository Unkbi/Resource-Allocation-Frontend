import React from 'react';
import { Field, ErrorMessage } from 'formik';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  styled,
} from '@mui/material';

// Styled Select Component
const StyledSelect = styled(Select)(({ theme }) => ({
  height: '38px',
  width: '340px',
  borderRadius: '0px',
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D6DCE1',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D6DCE1',
    },
  },
}));

// Styled MenuItem Component
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: 'Manrope, sans-serif',
  fontSize: '14px',
}));

// Styled FormControl Component
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: '340px',
  marginBottom: '16px',
  height: '38px',
}));

const CustomSelect = ({
  name,
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
  helperText,
}) => {
  return (
    // <StyledFormControl fullWidth margin="normal" error={error}>
    <StyledSelect name={name} value={value} onChange={onChange} onBlur={onBlur}>
      {options.map(option => (
        <StyledMenuItem key={option.value} value={option.value}>
          {option.label}
        </StyledMenuItem>
      ))}
    </StyledSelect>
    //   {helperText && <FormHelperText>{helperText}</FormHelperText>}
    //   <ErrorMessage name={name} component="div" />
    // </StyledFormControl>
  );
};

export default CustomSelect;
