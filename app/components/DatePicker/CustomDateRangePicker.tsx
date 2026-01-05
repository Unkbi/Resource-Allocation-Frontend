import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  DateRangePicker,
  SingleInputDateRangeField,
} from '@mui/x-date-pickers-pro';
import {
  TextField,
  FormHelperText,
  Box,
  FormControl,
  styled,
} from '@mui/material';
import 'dayjs/locale/en-gb';
import updateLocale from 'dayjs/plugin/updateLocale';
import { DEFAULT_LOCALE } from '@/app/constants/constants';
import StyledLabel from '../Label/StyledLabel';

dayjs.extend(updateLocale);
dayjs.updateLocale(DEFAULT_LOCALE, { weekStart: 1 });

const CustomTextField = styled(TextField, {
  shouldForwardProp: prop => prop !== 'error',
})<{ error?: boolean }>(({ theme, error }) => ({
  height: '36px',
  width: '160px',
  '& .MuiInputBase-root': {
    height: '36px',
    fontFamily: theme?.typography?.fontFamily,
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

const StyledSingleInputDateRangeField = (isButton: boolean) => ({
  height: isButton ? '40px' : '32px',
  width: '100%',
  borderRadius: '6px',
  background: '#FFF',
  color: '#374151',
  fontFamily: '"Open Sans", sans-serif',
  fontSize: isButton ? '14px' : '12px',
  fontStyle: 'normal',
  fontWeight: isButton ? 600 : 500,
  lineHeight: '20px',
  marginBottom: '6px',

  '& .MuiInputBase-root': {
    height: isButton ? '39px' : '36px',
    width: isButton ? '150px' : '100%',
    fontSize: isButton ? '14px' : '12px',
    fontWeight: isButton ? 500 : 400,
    fontFamily: '"Open Sans", sans-serif',
    color: '#374151',
    background: '#FFF',
    borderRadius: '6px',
    gap: '8px',
    ...(isButton && { padding: '0px' }),

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
});

interface DateRangeValue {
  StartDate?: string;
  EndDate?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

interface FormikProps {
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

interface CustomDateRangePickerProps {
  value: DateRangeValue;
  placeholder?: string;
  formikProps?: FormikProps;
  error?: boolean;
  helperText?: string;
  customStyles?: boolean;
  startDateLabel?: string;
  endDateLabel?: string;
  showLabel?: boolean;
  format?: string;
  isButton?: boolean;
  handleDateField?: (start: string, end: string) => void;
  popperProps?: object;
  title?: string;
  isProjectForm?: boolean;
  showCalendarIconOnlyHere?: boolean;
  singleClick?: boolean;
}

export default function CustomDateRangePicker({
  value,
  placeholder,
  formikProps = { setFieldValue: () => {} },
  error = false,
  helperText,
  customStyles,
  startDateLabel = '',
  endDateLabel = '',
  showLabel = true,
  format = 'MM/DD/YYYY',
  isButton = false,
  handleDateField = () => {},
  popperProps = {},
  title,
  isProjectForm = false,
  showCalendarIconOnlyHere = false,
  singleClick = false
}: CustomDateRangePickerProps) {
  const { setFieldValue } = formikProps;

  const selectedDate: [Dayjs | null, Dayjs | null] = [
    value?.StartDate || value?.startDate
      ? dayjs(value?.StartDate || value?.startDate)
      : null,
    value?.EndDate || value?.endDate
      ? dayjs(value?.EndDate || value?.endDate)
      : null,
  ];

  const handleDateChange = (newValue: [Dayjs | null, Dayjs | null]) => {
    const [start, end] = newValue;
    if (singleClick) {
      const [clicked] = newValue;
      if (!clicked) return;
      const clickedDate = dayjs(clicked);
      const monday = clickedDate.startOf('week');
      const sunday = clickedDate.endOf('week');
      const prevStartRaw = value?.StartDate || value?.startDate;
      const prevEndRaw = value?.EndDate || value?.endDate
      let newStart: Dayjs;
      let newEnd: Dayjs;
      if (!prevStartRaw || !prevEndRaw) {
        newStart = clickedDate;
        newEnd = sunday;
      } else {
        const prevStart = dayjs(prevStartRaw);
        const prevEnd = dayjs(prevEndRaw);
        if (clickedDate.isBefore(prevStart, 'day')) {
          newStart = monday;
          newEnd = prevEnd;
        }
        else if (clickedDate.isAfter(prevEnd, 'day')) {
          newStart = clickedDate;
          newEnd = sunday;
        }
        else {
          newStart = clickedDate;
          newEnd = clickedDate;
        }
      }
      const formattedStart = newStart.format('YYYY-MM-DD');
      const formattedEnd = newEnd.format('YYYY-MM-DD');
      
      if (value?.startDate && value?.endDate) {
        setFieldValue('startDate', formattedStart);
        setFieldValue('endDate', formattedEnd);
      } else {
        setFieldValue('StartDate', formattedStart);
        setFieldValue('EndDate', formattedEnd);
      }
      handleDateField(formattedStart, formattedEnd);
    } else {
      if (isButton) {
        if (start && end) {
          const formattedStart = dayjs(start).format('YYYY-MM-DD');
          const formattedEnd = dayjs(end).format('YYYY-MM-DD');
          handleDateField(formattedStart, formattedEnd);
        }
      } else {
        if (start && !end) {
          const formattedDate = dayjs(start).format('YYYY-MM-DD');
          setFieldValue('StartDate', formattedDate);
          setFieldValue('EndDate', formattedDate);
        } else if (start && end) {
          const formattedStart = dayjs(start).format('YYYY-MM-DD');
          const formattedEnd = dayjs(end).format('YYYY-MM-DD');
          if (value?.startDate && value?.endDate) {
            setFieldValue('startDate', formattedStart);
            setFieldValue('endDate', formattedEnd);
            handleDateField(formattedStart, formattedEnd);
          } else {
            setFieldValue('StartDate', formattedStart);
            setFieldValue('EndDate', formattedEnd);
          }
        }
      }
    }
  };

  const getWeeksAfter = (startDate: Dayjs | null): Dayjs | undefined => {
    if (!startDate) return undefined;
    const weekStartMonday = dayjs(startDate).startOf('week');
    const fiftyOneWeeksLater = weekStartMonday.add(51, 'weeks');
    return fiftyOneWeeksLater.add(7, 'days');
  };

  return (
    <FormControl sx={isButton ? { width: '56%' } : {}} error={error} fullWidth>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={DEFAULT_LOCALE}
      >
        {showLabel && (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '122px' }}>
            <StyledLabel>{title}</StyledLabel>
          </Box>
        )}
        <Box
          sx={{
            width: isButton ? '134px' : '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <DateRangePicker
            calendars={1}
            displayWeekNumber
            value={selectedDate}
            onChange={newValue => handleDateChange(newValue)}
            localeText={{ start: '', end: '' }}
            format={format}
            slots={{ field: SingleInputDateRangeField }}
            slotProps={{
              popper: {
                placement: isProjectForm ? 'top-start' : 'bottom-start',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: isProjectForm ? [0, 100] : [0, 0],
                    },
                  },
                ],
              },
              fieldSeparator: { sx: { display: 'none' } },
              textField: {
                variant: 'outlined',
                error: error,
                placeholder: placeholder,
                sx: StyledSingleInputDateRangeField(isButton),
                InputProps: {
                  ...(showCalendarIconOnlyHere && {
                    startAdornment: (
                      <img
                        src="/images/icons/CalendarIcon.svg"
                        alt="Calendar"
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '6px',
                          marginLeft: '6px',
                        }}
                      />
                    ),
                  }),
                  ...(!isButton && {
                    endAdornment: (
                      <img
                        src="/images/icons/calendar.svg"
                        alt="Calendar"
                        style={{
                          width: '13px',
                          height: '14.4px',
                          cursor: 'pointer',
                        }}
                      />
                    ),
                  }),
                },
              },
              desktopPaper: customStyles
                ? {
                    sx: {
                      position: isProjectForm ? 'absolute' : 'relative',
                      top: '0px',
                    },
                  }
                : {},
            }}
          />
        </Box>
      </LocalizationProvider>
      {error && (
        <FormHelperText style={{ fontSize: '0.75rem', marginLeft: '0px' }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
