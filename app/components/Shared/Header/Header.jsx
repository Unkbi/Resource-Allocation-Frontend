import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, TextField, InputAdornment } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import './header.css';

const Header = () => {
  return (
    <AppBar position="static" color="default" className="header">
      <Toolbar>
        <Typography variant="h6" noWrap>
          Settings
        </Typography>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="search-bar">
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
    </div>
          <IconButton>
            <SettingsIcon />
          </IconButton>
          <Avatar alt="User" src="/static/images/avatar/1.jpg" />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
