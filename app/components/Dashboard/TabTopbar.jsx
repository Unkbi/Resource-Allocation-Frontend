import React from 'react';
import { Global, css } from '@emotion/react';
import { Box, Typography, Button, Menu, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Topbar = ({
  text,
  selectedDate,
  setSelectedDate,
  selectedOption,
  setSelectedOption,
  anchorEl,
  setAnchorEl,
}) => {

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = option => {
    setAnchorEl(null);
    if (option) {
      setSelectedOption(option); // Update the selected option
    }
  };

  return (
    <>
    <Global
  styles={css`
    .MuiStack-root {
      overflow: unset !important; /* Override the overflow property */
    }
  `}
/>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 1,
        mt: 2,
        pl: 2,
        justifyContent: 'space-between',
      }}
    >
      <Typography
        variant="h2"
        sx={{ fontSize: '24px', fontWeight: 700, color: '#000000' }}
      >
        Overview
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={['DatePicker']}>
            <DatePicker
              displayWeekNumber
              label="Select a Date"
              value={selectedDate}
              style={{overflow: 'unset !important'}}
              sx={{
                '& .MuiInputBase-root': {
                  height: '40px', // Match height with dropdown
                  width: '170px', // Match width with dropdown
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2', // Optional: Match border color
                },
                '& .MuiStack-root': {
                  overflow: 'unset !important',
                },
              }}
              onChange={newValue => setSelectedDate(newValue)}
              renderInput={params => <TextField {...params} />}
            />
          </DemoContainer>
        </LocalizationProvider>
        <Button
          variant="outlined"
          endIcon={<ArrowDropDownIcon />}
          onClick={handleMenuOpen}
          sx={{
            height: '40px', // Match height with DatePicker
            width: '150px', // Match width with DatePicker
            textTransform: 'none', // Keep text consistent
            fontWeight: 500,
          }}
        >
          {selectedOption}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleMenuClose(null)}
        >
          <MenuItem onClick={() => handleMenuClose('Weekly')}>Weekly</MenuItem>
          {/* <MenuItem onClick={() => handleMenuClose('Monthly')}>
            Monthly
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose('Quarterly')}>
            Quarterly
          </MenuItem> */}
        </Menu>
      </Box>
    </Box>
    </>
  );
};

export default Topbar;
