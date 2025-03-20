import React from 'react';
import { Select, MenuItem, styled } from '@mui/material';

const StyledSelect = styled(Select)(({ theme, width }) => ({
  height: '36px',
  width: width || '340px',
  fontSize: '12px',
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

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: 'Open Sans',
  fontSize: '12px',
}));

const CustomSelect = ({ name, options, value, onChange, onBlur, width }) => {
  return (
    <StyledSelect
      name={name}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      width={width}
      IconComponent={() => (
        <img
          src="/images/icons/dropdown-icon.svg"
          alt="dropdown"
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '15px',
          }}
        />
      )}
    >
      {options?.map(option => (
        <StyledMenuItem key={option.value} value={option.value}>
          {option.label}
        </StyledMenuItem>
      ))}
    </StyledSelect>
  );
};

export default CustomSelect;
