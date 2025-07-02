import React from 'react';
import Button from '@mui/material/Button';
import { ButtonProps } from '@mui/material/Button';

interface CustomButtonProps extends ButtonProps {
  label: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  variant = 'contained',
  ...props
}) => {
  return (
    <Button variant={variant} {...props}>
      {label}
    </Button>
  );
};

export default CustomButton;
