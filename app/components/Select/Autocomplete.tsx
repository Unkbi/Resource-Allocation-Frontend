'use client';

import { Autocomplete, TextField } from '@mui/material';
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
  value: string;
  formikProps: FormikProps<any>;
  required?: boolean;
  FormHelperTextProps?: any;
  disableClearable?: boolean;
  onChange?: (value: any) => void;
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
  onChange,
}) => {
  const { touched, errors, setFieldValue, setFieldTouched } = formikProps;
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || null;
  const hasError = touched[name] && errors[name] && !value;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => option.label || ''}
      value={value === '' ? null : selectedOption}
      disableClearable={disableClearable}
      isOptionEqualToValue={(opt, val) => opt.value === val?.value}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => {
        setOpen(false);
        setFieldTouched(name, true);
      }}
      onChange={(_, newValue) => {
        const currentValue = formikProps.values[name];
        const isSameValue = currentValue === newValue?.value;
        const finalValue = isSameValue ? '' : (newValue?.value ?? '');

        setFieldValue(name, finalValue, true); 
        if (onChange) {
          onChange(finalValue);
        }
      }}
      onBlur={() => {
        if (value || required) {
          setFieldTouched(name, true, true);
        }
      }}
      renderOption={(props, option) => {
        const { key, ...restProps } = props;
        const isSelected = selectedOption?.value === option.value;

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
      }}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={label || ''}
          required={required}
          name={name}
          error={Boolean(hasError)}
          helperText={hasError ? (errors[name] as string) : undefined}
          FormHelperTextProps={FormHelperTextProps}
          sx={{
            '& .MuiInputBase-root': {
              height: '34px',
              fontSize: '12px',
            },
            '& input': {
              padding: '0 8px',
            },
          }}
          onFocus={() => setOpen(true)}
        />
      )}
      sx={{
        '& .MuiInputBase-root': { fontSize: '12px' },
        '& .MuiAutocomplete-tag': { fontSize: '10px', padding: '2px 5px' },
        '& input': { fontSize: '12px' },
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
