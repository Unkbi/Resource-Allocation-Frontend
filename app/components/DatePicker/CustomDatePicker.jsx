import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { styled } from '@mui/system';
import { PickersLayout } from '@mui/x-date-pickers';

const StyledPickersLayout = styled(PickersLayout)({
  '.MuiDateCalendar-root': {
    borderRadius: '0px',
    borderWidth: '0px',
    border: '0px solid',
    width: '300px',
  },
});

const CustomTextField = styled(TextField)({
  height: '36px',
  width: '160px',
  '& .MuiInputBase-root': {
    height: '36px',
    fontFamily: 'Open Sans',
    fontSize: '12px',
    fontWeight: 500,
    '&::placeholder': {
      color: '#757575',
      opacity: 1,
    },
  },
  '& .MuiIconButton-root': {
    backgroundColor: 'transparent !important',
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  },
});

export default function CustomDatePicker({
  name,
  value,
  placeholder,
  formikProps,
}) {
  const { setFieldValue } = formikProps;

  const handleDateChange = (newValue) => {
    const formattedDate = newValue ? dayjs(newValue).format('YYYY-MM-DD') : null;
    setFieldValue(name, formattedDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ? dayjs(value) : null}
        onChange={handleDateChange}
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
          textField: {
            placeholder: placeholder,
          },
        }}
      />
    </LocalizationProvider>
  );
}