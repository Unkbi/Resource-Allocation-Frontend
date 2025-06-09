import React from 'react';
import {
  Select,
  MenuItem,
  styled,
  Typography,
  FormHelperText,
  FormControl,
} from '@mui/material';

const StyledSelect = styled(Select)(({ width }) => ({
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

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
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
  forceClose = false,
  isResourceForm = false,
}) => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (forceClose) setOpen(false);
  }, [forceClose]);

  const renderValue = selected => {
    if (!Array.isArray(selected)) {
      const label =
        options?.find(option => option.value === selected)?.label || '';
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
          {label}
        </Typography>
      );
    }

    const selectedLabels = options
      ?.filter(option => selected.includes(option.value))
      .map(option => option.label)
      .join(', ');

    return (
      <Typography
        component="span"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '12px',
        }}
        title={selectedLabels}
      >
        {selectedLabels}
      </Typography>
    );
  };

  return (
    <FormControl style={{ width: width || '340px' }} error={error}>
      <StyledSelect
        name={name}
        value={value}
        onChange={e => {
          const selectedValue = e.target.value;

          if (multiple) {
            const newValue = Array.isArray(value) ? [...value] : [];

            if (newValue.includes(selectedValue)) {
              onChange({
                target: {
                  name,
                  value: newValue.filter(v => v !== selectedValue),
                },
              });
            } else {
              onChange({
                target: {
                  name,
                  value: [...newValue, selectedValue],
                },
              });
            }
          } else {
            // Handled by onClick below to allow deselection
          }
        }}
        onBlur={onBlur}
        open={open}
        width={width}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        multiple={multiple}
        displayEmpty
        renderValue={renderValue}
        MenuProps={
          isResourceForm
            ? {
                anchorOrigin: { vertical: 'top', horizontal: 'left' },
                transformOrigin: { vertical: 'bottom', horizontal: 'left' },
                PaperProps: { style: { maxHeight: 200, maxWidth: 340 } },
                MenuListProps: { disablePadding: true },
              }
            : {
                PaperProps: { style: { maxHeight: 200, maxWidth: 340 } },
                MenuListProps: { disablePadding: true },
              }
        }
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
        {options?.map(option => {
          const isSelected = multiple
            ? Array.isArray(value) && value.includes(option.value)
            : value === option.value;

          return (
            <StyledMenuItem
              key={option.value}
              value={option.value}
              title={option.label}
              selected={isSelected}
              onClick={() => {
                if (multiple) {
                  const newValue = Array.isArray(value) ? [...value] : [];
                  const updatedValue = newValue.includes(option.value)
                    ? newValue.filter(v => v !== option.value)
                    : [...newValue, option.value];

                  onChange({
                    target: {
                      name,
                      value: updatedValue,
                    },
                  });
                } else {
                  const newValue = value === option.value ? '' : option.value;
                  onChange({
                    target: {
                      name,
                      value: newValue,
                    },
                  });
                  setOpen(false); // Close dropdown manually
                }
              }}
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
          );
        })}
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
