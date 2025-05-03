import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField, FormHelperText, FormControl } from '@mui/material';
import { Box } from '@mui/system';
import { styled } from '@mui/material/styles';
import { PickersLayout } from '@mui/x-date-pickers';
import 'dayjs/locale/en-gb';
import updateLocale from 'dayjs/plugin/updateLocale';
import { DEFAULT_LOCALE } from '@/app/constants/constants';
import StyledLabel from '../Label/StyledLabel';

dayjs.extend(updateLocale);
dayjs.updateLocale(DEFAULT_LOCALE, { weekStart: 1 });

const StyledPickersLayout = styled(PickersLayout)({
  '.MuiDateCalendar-root': {
    borderRadius: '0px',
    borderWidth: '0px',
    border: '0px solid',
    width: '300px',
  },
});

const CustomTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'error'
})<{
  error?: boolean;
}>(({ theme, error }) => ({
  height: '36px',
  width: '160px',
  '& .MuiInputBase-root': {
    height: '36px',
    fontFamily: theme.typography.fontFamily,
    fontSize: '12px',
    fontWeight: 500,
    border: error ? theme.palette.error.main : undefined,
    '&:hover': {
      border: error ? theme.palette.error.main : undefined,
    },
    '&.Mui-focused': {
      border: error ? theme.palette.error.main : undefined,
    },
    '&::placeholder': {
      color: '#757575',
      opacity: 1,
    },
    '& input': {
      cursor: 'pointer',
    },
  },
  '& .MuiIconButton-root': {
    backgroundColor: 'transparent !important',
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  },
}));

interface CustomDatePickerProps {
  name: string;
  value: string | null;
  placeholder?: string;
  title?: string;
  isRequired?: boolean;
  error?: boolean;
  helperText?: string;
  customStyles?: boolean;
  formikProps: {
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    setFieldTouched: (field: string, touched: boolean, shouldValidate?: boolean) => void;
    values: Record<string, any>;
  };
}

export default function CustomDatePicker({
  name,
  value,
  placeholder,
  formikProps,
  error = false,
  helperText,
  customStyles,
  title,
  isRequired = false,
}: CustomDatePickerProps) {
  const { setFieldValue, values } = formikProps;
  const [open, setOpen] = React.useState(false);

  const handleDateChange = (newValue: Dayjs | null) => {
    const formattedDate = newValue ? dayjs(newValue).format('YYYY-MM-DD') : null;
    setFieldValue(name, formattedDate);
    setOpen(false);
  };

  const handleInputClick = () => {
    setOpen(true);
  };

  let minDate: Dayjs | undefined = undefined;
  let maxDate: Dayjs | undefined = undefined;

  if (name === 'StartDate' && values.endDate) {
    const end = dayjs(values.endDate);
    maxDate = end.isValid()
      ? end.isAfter(dayjs())
        ? end.subtract(0, 'day')
        : end
      : undefined;
    minDate = end.subtract(1, 'year');
  }

  if (name === 'EndDate' && values.startDate) {
    const start = dayjs(values.startDate);
    minDate = start;
    maxDate = start.add(1, 'year');
  }

  return (
    <FormControl
      style={{ width: '160px' }}
      error={error}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={DEFAULT_LOCALE}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: '122px' }}>
          <StyledLabel>
            {title}{' '}
            {(isRequired && formikProps.values.Status === 'Inactive') && (
              <span style={{ color: 'red' }}>*</span>
            )}
          </StyledLabel>
        </Box>
        <DatePicker
          displayWeekNumber
          format="MM/DD/YYYY"
          value={value ? dayjs(value) : null}
          onChange={handleDateChange}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          minDate={minDate}
          maxDate={maxDate}
          slots={{
            textField: CustomTextField,
            openPickerIcon: () => (
              <img
                src="/images/icons/calendar.svg"
                alt="Calendar"
                style={{ width: '13px', height: '14.4px' }}
              />
            ),
          }}
          slotProps={{
            desktopPaper: customStyles
              ? {
                  sx: {
                    position: 'absolute',
                    top: '-130px',
                    left: name === 'EndDate' ? '-120px' : '',
                  },
                }
              : {},
            textField: {
              onBlur: () => formikProps.setFieldTouched(name, true),
              placeholder,
              error,
              onClick: handleInputClick,
              InputProps: {
                readOnly: true,
              },
            },
          }}
        />
      </LocalizationProvider>
      {error && (
        <FormHelperText style={{ fontSize: '0.75rem', marginLeft: '0px' }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
