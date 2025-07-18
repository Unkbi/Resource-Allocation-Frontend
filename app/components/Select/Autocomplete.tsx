'use client';

import { Autocomplete, TextField } from '@mui/material';
import { FormikProps } from 'formik';

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
}) => {
  const { touched, errors, setFieldValue, setFieldTouched } = formikProps;


  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => option.label || ''}
      value={options.find(opt => opt.value === value) || null}
      disableClearable={disableClearable}
      isOptionEqualToValue={(opt, val) => opt.value === val?.value}
      onChange={(_, newValue) => {
        formikProps.setFieldValue(name, newValue?.value ?? '');
        formikProps.setFieldTouched(name, true, true);
      }}
      onBlur={() => setFieldTouched(name, true)}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={label || ''}
          required={required}
          name={name}
          error={Boolean(touched[name] && errors[name])}
          helperText={touched[name] && (errors[name] as string)}
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
