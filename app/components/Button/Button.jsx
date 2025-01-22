import React from 'react';
import Button from '@mui/material/Button';

const Button = ({ label, variant = 'contained', ...props }) => {
  return (
    <Button variant={variant} {...props}>
      {label}
    </Button>
  );
};

export default Button;
