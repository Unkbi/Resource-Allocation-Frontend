import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, TextField, InputAdornment, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import './header.css';

const Header = () => {
  return (
    <AppBar position="fixed" color="default" className="header" sx={{maxWidth:"calc(100vw - 250px)"}}>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Settings
        </Typography>
        <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box className="search-bar">
            <TextField
              placeholder="Search"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              variant="standard"
            />
          </Box>
          <IconButton>
            <SettingsIcon />
          </IconButton>
          <Avatar alt="User" src="/static/images/avatar/1.jpg" />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
