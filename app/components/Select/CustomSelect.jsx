import React from 'react';
import { Select, MenuItem, styled, Typography, FormHelperText } from '@mui/material';
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
  '& .MuiSelect-select': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '12px',
    paddingRight: '32px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    minHeight: '36px',
  },
}));

const StyledMenuItem = styled(MenuItem)(() => ({
  fontFamily: 'Open Sans',
  fontSize: '12px',
  height: '32px',
  padding: '8px 12px',
  width: '100%',      
  margin: 0,          
  boxSizing: 'border-box',
}));

const CustomSelect = ({
  name,
  options,
  value,
  onChange,
  onBlur,
  width,
  error,
  helperText,
  multiple = false,
  forceClose = false, // close if more than one item selected
}) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (forceClose) setOpen(false);
  }, [forceClose]);

  
  
  const renderValue = (selected) => {
    // Handle case where selected is boolean or not an array
    let selectedLabels;
    if (!Array.isArray(selected)) {
      selectedLabels = options?.filter(option => selected === option.value).map(option => option.label);
      return (
        <Typography
          component="span"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '12px',
          }}
        >
          {selectedLabels}
        </Typography>
      );
    }
  
     selectedLabels = options?.filter(option => selected.includes(option.value))
      .map(option => option.label);
     const joined = selectedLabels?.join(', ');
    
    return (
      <Typography
        component="span"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '12px',
        }}
        title={joined}
      >
        {joined}
      </Typography>
    );
  };

  return (
    <FormControl
      style={{ width: width || '340px' }}
      error={error}
    >
      <StyledSelect
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        open={open}
        width={width}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        multiple={multiple}
        displayEmpty
        renderValue={renderValue}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
              maxWidth: 340,
            },
          },
          MenuListProps: {
            disablePadding: true,
          },
        }}
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
          <StyledMenuItem
            key={option.value}
            value={option.value}
            title={option.label}
            sx={{
              width: '100%',
              padding: '8px 12px',
              margin: 0,
              boxSizing: 'border-box',
            }}
          >
            <Typography
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: '12px',
              }}
            >
              {option.label}
            </Typography>
          </StyledMenuItem>
        ))}
      </StyledSelect>
      {error && (
        <FormHelperText
          style={{
            fontSize: '0.75rem',
            marginLeft: '0px',
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default CustomSelect;
