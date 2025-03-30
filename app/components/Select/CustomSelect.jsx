import React from 'react';
import { Select, MenuItem, styled, Tooltip, FormHelperText } from '@mui/material';
import {FormControl} from '@mui/material';

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

const CustomSelect = ({ name, options, value, onChange, onBlur, width, error, helperText, multiple=false  }) => {
  if(multiple){
    return (
      <Tooltip title={helperText} open={error} placement="top">
        <StyledSelect
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          width={width}
          multiple
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
      </Tooltip>)
  } else {
    return (
      <FormControl
        style={{
          width: width || '340px',
        }}
        error={error} 
      >
      <StyledSelect
        name={name}
        value={value}
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
      {error && <FormHelperText  style={{
              fontSize: '0.75rem',
              marginLeft: '0px',
            }}>
              {helperText}
        </FormHelperText>}
      </FormControl>
    );
  }
};

export default CustomSelect;
