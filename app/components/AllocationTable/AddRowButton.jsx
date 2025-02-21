import { useRef, useState } from 'react';
import {
  Button,
  styled,
  Box,
  Autocomplete,
  TextField,
  Popper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CustomAvatar from '../Avatar/CustomAvatar';
import { useSelector } from 'react-redux';

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.custom.textColor,
  textTransform: 'none',
  fontSize: '12px',
  fontFamily: "'Manrope', serif",
  fontWeight: '600',
  padding: '0 16px',
  '& .MuiSvgIcon-root': {
    fontSize: '16px',
  },
  '&:hover': {
    backgroundColor: 'transparent',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
}));

const MainBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 'auto',
  margin: '0 -16px',
  '& .MuiInputBase-formControl': {
    padding: '0 !important',
  },
  '& .MuiOutlinedInput-input': {
    height: '51px',
    lineHeight: '32px',
    background: 'rgba(157, 201, 255, 0.3)',
    padding: '10px 16px !important',
    borderRadius: '0',
    fontFamily: "'Manrope', serif",
    fontSize: '12px',
    fontWeight: '600',
    color: '#313F68',
    boxSizing: 'border-box',
    border: '1px solid #298AFF',
    '&::placeholder': {
      color: '#424242',
      opacity: 1,
      fontFamily: "'Manrope', serif",
      fontSize: '12px',
      fontWeight: '600',
    },
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    border: 'none',
    borderRadius: '0',
    padding: '0',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
    borderRadius: '0px',
  },
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
  '& ul': {
    maxHeight: '156px',
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#C4CAD4',
    },
  },
  '& .MuiAutocomplete-noOptions': {
    fontFamily: "'Manrope', serif",
    fontSize: '12px',
  },
  '& .MuiAutocomplete-option': {
    padding: '10px !important',
    border: 'none',
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontSize: '12px',
    fontWeight: '600',
    alignItems: 'flex-start !important',
  },
  '& .userEamil': {
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontSize: '10px',
    fontWeight: '500',
    display: 'block',
  },
  '& .MuiAvatar-root': {
    width: '16px',
    height: '16px',
    marginRight: '8px',
    marginTop: '2px',
  },
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.divider,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const allProject = [
  {
    FirstName: 'Piyush',
    StartDate: '28-Jan-2024',
    Id: '7ee6849f-0700-43a1-aac5-e403af595217',
    LocationCategory: 'Onsite',
    Email: 'piyush.modi@qtsolv.com',
    HRLevel: '1',
    HourlyRate: null,
    Manager: 'Shalini',
    LastName: 'Modi',
    PhoneNumber: '9782306393',
    AverageWeeklyHours: 40,
    Department: 'Engineering',
    HourlyRateCurrency: 'USD',
    Type: 'FTE',
    WorkLocation: null,
    EndDate: null,
    Role: 'Developer',
    FullName: 'Piyush Modi',
    Status: 'Active',
  },
  {
    FirstName: 'Emma ',
    StartDate: '2020-08-30',
    Id: '07da8f8d-3381-4ac8-92a5-41dc30576f5c',
    LocationCategory: 'Onsite',
    Email: 'emma.johnson@ciotest.com',
    HRLevel: '1',
    HourlyRate: null,
    Manager: 'Liam Smith',
    LastName: 'Johnson',
    PhoneNumber: '',
    AverageWeeklyHours: 40,
    Department: 'Smith Inc',
    HourlyRateCurrency: 'USD',
    Type: 'FTE',
    WorkLocation: 'USA-Remote',
    EndDate: null,
    Role: 'CEO',
    FullName: 'Emma Johnson',
    Status: 'Active',
  },
];
export const AddRowButton = ({
  project,
  handleAddRow,
  onClick,
  buttonName = 'Add Resource',
  resourceProjects,
}) => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { resources } = useSelector(state => state.resources);

  const defaultProps = {
    options:
      buttonName === 'Add Project'
        ? resourceProjects
        : resources?.[0]?.result || [],
    getOptionLabel: option =>
      buttonName === 'Add Project' ? option.Name : option.FullName,
  };
  const inputRef = useRef(null);

  const handleButtonClick = () => {
    setIsSearchMode(true);
    onClick();
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  return (
    <MainBox>
      {isSearchMode && resources.length > 0 ? (
        <Autocomplete
          {...defaultProps}
          id="open-on-focus"
          onChange={(event, newValue) => {
            if (newValue) {
              handleAddRow(event, newValue);
            }
            setIsSearchMode(false);
          }}
          onBlur={() => setIsSearchMode(false)}
          popupIcon={null}
          slots={{ popper: StyledPopper }}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <Box
                component="li"
                key={key}
                {...optionProps}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderBottom: `1px solid ${'#eaecef'}`,
                }}
              >
                {buttonName !== 'Add Project' && (
                  <CustomAvatar value={option.FullName} />
                )}
                {/* Resource Details */}

                <Box sx={{ flexGrow: 1 }}>
                  <span>
                    {buttonName === 'Add Project'
                      ? option.Name
                      : option.FullName}
                  </span>
                  {buttonName !== 'Add Project' && (
                    <span className="userEamil">{option.Email}</span>
                  )}
                </Box>
              </Box>
            );
          }}
          renderInput={params => (
            <StyledInput {...params} inputRef={inputRef} />
          )}
        />
      ) : (
        <StyledButton
          variant="text"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleButtonClick}
        >
          {buttonName}
        </StyledButton>
      )}
    </MainBox>
  );
};
