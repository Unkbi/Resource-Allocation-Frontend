import React from 'react';
import Button from '@mui/material/Button';
import { ButtonProps } from '@mui/material/Button';

interface CustomButtonProps extends ButtonProps {
  label: React.ReactNode;
}

// I'm changing the name of the button to avoid nameing conflict 
const CustomButton: React.FC<CustomButtonProps> = ({ label, variant = 'contained', ...props }) => {
  return (
    <Button variant={variant} {...props}>
      {label}
    </Button>
  );
};

export default Button;
