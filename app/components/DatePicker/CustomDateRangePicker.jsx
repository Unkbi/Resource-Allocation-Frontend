import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField ,FormHelperText, Box} from '@mui/material';
import { styled } from '@mui/system';
import {FormControl} from '@mui/material';
import 'dayjs/locale/en-gb';
import updateLocale from 'dayjs/plugin/updateLocale';
import { DEFAULT_LOCALE } from '@/app/constants/constants';
import { DateRangePicker,SingleInputDateRangeField, } from '@mui/x-date-pickers-pro';
import StyledLabel from '../Label/StyledLabel';
 
dayjs.extend(updateLocale);
dayjs.updateLocale(DEFAULT_LOCALE, { weekStart: 1 });
 
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

const StyledsingleInputDateRangeField = {
  height: '36px',
  width: '100%',
  '& .MuiInputBase-root': {
    height: '36px',
    fontSize: '12px',
    fontWeight: 500,
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
};


 
export default function CustomDateRangePicker({ value, placeholder, formikProps, error, helperText, customStyles, startDateLabel="", endDateLabel=""}) {
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

  const handleClose = () =>{
      const [start, end] = selectedDate;
    
      if (start && !end) {
        const formattedDate = dayjs(start).format("YYYY-MM-DD");
        setFieldValue("StartDate", formattedDate);
        setFieldValue("EndDate", formattedDate);
      }  
  }

 
  return (
    <FormControl error={error}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={DEFAULT_LOCALE}>
        <Box sx={{display:"flex",flexDirection:"row", gap: "122px"}}>
          {/* <StyledLabel>
            {startDateLabel}
          </StyledLabel>
          <StyledLabel>
            {endDateLabel}
          </StyledLabel> */}
          <StyledLabel>Date Range</StyledLabel>
          </Box>
          <Box sx={{ width: '330px' }}>
          <DateRangePicker 
           calendars={1}
           displayWeekNumber
           value= {selectedDate}
           onChange={(newValue) => handleDateChange(newValue)}
           onClose={handleClose}
           localeText={{ start: '', end: '' }} 
           format='MM/DD/YYYY'
           slots={{
            field: SingleInputDateRangeField,
          }}
          slotProps={{
            fieldSeparator: { sx: { display:"none" } } ,
            textField: {
              variant: 'outlined',
              error: error,
              placeholder: placeholder,
              sx : StyledsingleInputDateRangeField,
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
      </Box>
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