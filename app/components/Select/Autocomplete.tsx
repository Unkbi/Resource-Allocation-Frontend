'use client';

import { Autocomplete, TextField, useTheme } from '@mui/material';
import { FormikProps } from 'formik';
import { useState } from 'react';

interface Option {
  value: any;
  label: string;
}

interface StyledAutocompleteProps {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  value: string | string[];
  formikProps: FormikProps<any>;
  required?: boolean;
  FormHelperTextProps?: any;
  disabled?: boolean;
  disableClearable?: boolean;
  fullWidth?: boolean;
  multiple?: boolean;
  onChange?: (value: any) => void;
  readOnly?: boolean
}

const StyledAutocomplete: React.FC<StyledAutocompleteProps> = ({
  name,
  label,
  options,
  value,
  formikProps,
  required = false,
  FormHelperTextProps = {
    sx: {
      fontSize: '12px',
      marginLeft: '4px',
      color: '#d32f2f',
    },
  },
  disableClearable = false,
  disabled = false,
  multiple = false,
  onChange,
  readOnly = false
}) => {
  const { touched, errors, setFieldValue, setFieldTouched } = formikProps;
  const [open, setOpen] = useState(false);

  // Handle both single and multiple select
  const selectedOption = multiple
    ? options?.filter(
        opt => Array.isArray(value) && value.includes(opt.value)
      ) || []
    : options?.find(opt => opt.value === value) || null;

  const hasError =
    touched[name] &&
    errors[name] &&
    (multiple
      ? !value || (Array.isArray(value) && value.length === 0)
      : !value);
  const theme = useTheme();

  const effectivePlaceholder = disabled
    ? ''
    : (
          multiple
            ? !value || (Array.isArray(value) && value.length === 0)
            : !value
        )
      ? label
      : '';

  return (
    <Autocomplete
      disabled={disabled}
      multiple={multiple}
      options={options}
      readOnly={readOnly} 
      getOptionLabel={option => option.label || ''}
      value={
        multiple
          ? value === '' || !Array.isArray(value)
            ? []
            : selectedOption
          : value === ''
            ? null
            : selectedOption
      }
      disableClearable={disableClearable}
      isOptionEqualToValue={(opt, val) => opt.value === val?.value}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => {
        setOpen(false);
        setFieldTouched(name, true);
      }}
      onChange={(_, newValue) => {
        if (multiple) {
          // Multiple select mode
          const selectedValues = Array.isArray(newValue)
            ? newValue.map(opt => opt.value)
            : [];
          setFieldValue(name, selectedValues, true);
          if (onChange) {
            onChange(selectedValues);
          }
        } else {
          // Single select mode
          const currentValue = formikProps.values[name];
          const singleValue = Array.isArray(newValue) ? null : newValue;
          const isSameValue = currentValue === singleValue?.value;
          const finalValue = isSameValue ? '' : (singleValue?.value ?? '');

          setFieldValue(name, finalValue, true);
          if (onChange) {
            onChange(finalValue);
          }
        }
      }}
      onBlur={() => {
        if (value || required) {
          setFieldTouched(name, true, true);
        }
      }}
      renderOption={(props, option) => {
        const { key, ...restProps } = props;

        if (multiple) {
          // Multiple select: use default checkbox behavior
          const isSelected =
            Array.isArray(selectedOption) &&
            selectedOption.some(opt => opt.value === option.value);

          return (
            <li key={key} {...restProps}>
              {option.label}
            </li>
          );
        } else {
          // Single select: toggle behavior
          const isSelected =
            !Array.isArray(selectedOption) &&
            selectedOption?.value === option.value;

          return (
            <li
              key={key}
              {...restProps}
              onClick={e => {
                e.stopPropagation();
                if (isSelected) {
                  setFieldValue(name, '', true);
                  if (onChange) onChange('');
                } else {
                  setFieldValue(name, option.value, true);
                  if (onChange) onChange(option.value);
                }
                setFieldTouched(name, true, true);
                setOpen(false);
              }}
            >
              {option.label}
            </li>
          );
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={effectivePlaceholder || ''}
          required={required}
          name={name}
          error={Boolean(hasError)}
          helperText={hasError ? (errors[name] as string) : undefined}
          FormHelperTextProps={FormHelperTextProps}
          sx={{
            '& .MuiInputBase-root': {
              minHeight: '34px',
              height: multiple ? 'auto' : '34px',
              fontSize: '12px',
              padding: multiple ? '2px 8px' : '0px 8px',
              alignItems: 'center',
            },
            '& input': {
              padding: '8px 6px !important',
            },
            '& .MuiAutocomplete-endAdornment': {
              top: multiple ? '50%' : 'calc(50% - 14px)',
              transform: multiple ? 'translateY(-50%)' : 'none',
            },
            '& .Mui-disabled': {
              backgroundColor: disabled
                ? // @ts-ignore
                  theme.palette.readonly.main // This is a custom color in the theme
                : '#F8FAFC !important',
              cursor: 'default',
            },
            '& .Mui-disabled .MuiInputBase-input': {
              color: disabled ? '#6B7280 !important' : '#1E293B !important',
              WebkitTextFillColor: disabled
                ? // @ts-ignore
                  theme.palette.readonly.contrastText // This is a custom color in the theme
                : '#1E293B !important',
            },
          }}
          onFocus={() => setOpen(true)}
        />
      )}
      sx={{
        '& .Mui-disabled': {
          opacity: '100% !important',
        },
        '& .Mui-disabled .MuiChip-label': {
          color: '#1E293B !important',
        },
        '& .MuiInputBase-root': {
          fontSize: '12px',
          flexWrap: 'wrap',
        },
        '& .MuiAutocomplete-tag': {
          fontSize: '12px',
          height: '22px',
          margin: '2px',
          '& .MuiChip-label': {
            padding: '0 6px',
          },
          '& .MuiChip-deleteIcon': {
            fontSize: '14px',
            margin: '0 2px 0 -2px',
          },
        },
        '& input': {
          fontSize: '12px',
          minWidth: multiple ? '30px' : 'auto',
          padding: '8px 6px !important',
        },
        '& .MuiAutocomplete-popper': { fontSize: '12px' },
        '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
      }}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                boundary: 'window',
              },
            },
          ],
        },
        paper: {
          sx: {
            fontSize: '12px',
          },
        },
      }}
    />
  );
};

export default StyledAutocomplete;
