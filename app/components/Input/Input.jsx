// should this file be delete?
import React from 'react';
import Input from '@mui/material/Input';

const Input = ({ label, variant = 'outlined', ...props }) => {
    return <Input label={label} variant={variant} {...props} />;
};

export default Input;
