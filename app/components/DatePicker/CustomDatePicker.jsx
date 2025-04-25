import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField ,FormHelperText} from '@mui/material';
import { styled } from '@mui/system';
import { PickersLayout } from '@mui/x-date-pickers';
import {FormControl} from '@mui/material';
import 'dayjs/locale/en-gb';
import updateLocale from 'dayjs/plugin/updateLocale';
import { DEFAULT_LOCALE } from '@/app/constants/constants';

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

const CustomTextField = styled(TextField)(({ theme, error }) => ({
  height: '36px',
  width: '160px',
  '& .MuiInputBase-root': {
    height: '36px',
    fontFamily: theme.typography.fontFamily,
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

export default function CustomDatePicker({ name, value, placeholder, formikProps, error, helperText, customStyles}) {
  const { setFieldValue, values } = formikProps
  const [open, setOpen] = React.useState(false)

  const handleDateChange = (newValue) => {
    const formattedDate = newValue ? dayjs(newValue).format("YYYY-MM-DD") : null
    setFieldValue(name, formattedDate)
    setOpen(false)
  }

  const handleInputClick = () => {
    setOpen(true)
  }
  // Calculate maxDate and minDate for visual restriction
  let minDate = undefined;
  let maxDate = undefined;

  if (name === 'startDate' && values.endDate) {
    maxDate = dayjs(values.endDate).isValid()
      ? dayjs(values.endDate).isAfter(dayjs())
        ? dayjs(values.endDate).subtract(0, 'day')
        : dayjs(values.endDate)
      : undefined;
    minDate = dayjs(values.endDate).subtract(1, 'year');
  }

  if (name === 'endDate' && values.startDate) {
    minDate = dayjs(values.startDate);
    maxDate = dayjs(values.startDate).add(1, 'year');
  }

  return (
    <FormControl
      style={{
        width: '160px',
      }}
      error={error}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={DEFAULT_LOCALE}>
        <DatePicker
          displayWeekNumber
          value={value ? dayjs(value) : null}
          onChange={handleDateChange}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          minDate={minDate}
          maxDate={maxDate}
          slots={{
            layout: StyledPickersLayout,
            textField: CustomTextField,
            openPickerIcon: () => (
              <img
                src="/images/icons/calendar.svg"
                alt="Calendar"
                style={{
                  width: '13px',
                  height: '14.4px',
                }}
              />
            ),
          }}
          slotProps={{
            desktopPaper: {
              ...(customStyles ? {
                sx: {
                  position: "absolute",
                  top: "-130px",
                  left: name === "EndDate" ? "-120px" : ""
                }
              } : {})
            },
            textField: {
              placeholder: placeholder,
              error: error,
              helperText: error ? helperText : '',
              onClick: handleInputClick,
              InputProps: {
                readOnly: true,
                value: value || ""
              },
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