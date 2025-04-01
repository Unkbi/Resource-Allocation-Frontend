import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField ,FormHelperText} from '@mui/material';
import { styled } from '@mui/system';
import { PickersLayout } from '@mui/x-date-pickers';
import {FormControl} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
 
import 'dayjs/locale/en-gb';
import updateLocale from 'dayjs/plugin/updateLocale';
import { DEFAULT_LOCALE } from '@/app/constants/constants';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
 
dayjs.extend(updateLocale);
dayjs.updateLocale(DEFAULT_LOCALE, { weekStart: 1 });
 
const CustomTextField = styled(TextField)(({ theme, error }) => ({
  height: '36px',
  width: '160px',
  '& .MuiInputBase-root': {
    height: '36px',
    fontFamily: 'Open Sans',
    fontSize: '12px',
    fontWeight: 500,
    border: error && theme.palette.error.main,
    '&:hover': {
      border: error && theme.palette.error.main
    },
    '&.Mui-focused': {
      border: error && theme.palette.error.main
    },
    '&::placeholder': {
      color: '#757575',
      opacity: 1,
    },
    "& input": {
      cursor: "pointer",
    },
  },
  '& .MuiIconButton-root': {
    backgroundColor: 'transparent !important',
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  },
}));
 
export default function CustomDateRangePicker({ value, placeholder, formikProps, error, helperText, customStyles}) {
  const { setFieldValue } = formikProps
  const selectedDate = [
    value.StartDate ? dayjs(value.StartDate) : null,
    value.EndDate ? dayjs(value.EndDate) : null
  ];

  const handleDateChange = (newValue) => {
      if (newValue && Array.isArray(newValue)) {
        const [start, end] = newValue;
        const formattedStart = start && dayjs(start).format("YYYY-MM-DD");
        const formattedEnd = end && dayjs(end).format("YYYY-MM-DD");
        setFieldValue("StartDate", formattedStart);
        setFieldValue("EndDate", formattedEnd);
      }
  }

 
  return (
    <FormControl error={error}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={DEFAULT_LOCALE}>
          <DateRangePicker calendars={1}
           displayWeekNumber
           value= {selectedDate}
           onChange={(newValue) => handleDateChange(newValue)}
           localeText={{ start: '', end: '' }} 
           slots={{
            textField: CustomTextField
          }}
          slotProps={{
            textField: {
              variant: 'outlined',
              error: error,
              placeholder: placeholder,
              InputProps: {
                endAdornment: (
                  <img
                    src="/images/icons/calendar.svg"
                    alt="Calendar"
                    style={{ width: '13px', height: '14.4px', cursor:"pointer" }}
                  />
                ),
              },
            },
            desktopPaper: {
              ...(customStyles
                ? {
                    sx: {
                      position: 'absolute',
                      top: '-130px',
                    },
                  }
                : {}),
            },
          }}
           />
      </LocalizationProvider>
      {error && (
        <FormHelperText
          style={{
            fontSize: '0.75rem',
            marginLeft: '0px',
          }}>{helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}