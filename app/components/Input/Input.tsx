import React from 'react';
import TextField from '@mui/material/TextField';

interface InputProps {
  label: string;
  variant?: 'outlined' | 'filled' | 'standard';
  [key: string]: any; // Allow additional props
}

const CustomInput: React.FC<InputProps> = ({
  label,
  variant = 'outlined',
  ...props
}) => {
  return <TextField label={label} variant={variant} {...props} />;
};

export default CustomInput;
