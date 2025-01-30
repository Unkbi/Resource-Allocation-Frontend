"use client";
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, TextField, InputAdornment, styled, Box, colors } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const MainAppBar = styled(AppBar)(({ theme }) => ({
  marginLeft: "74px",
  width: "calc(100% - 74px)",
  zIndex: "91",
  boxShadow: "0 1px 0 0 #DDE1E4",
  background:"#fff",
  "& h6":{
    color: theme.custom.primaryColor,
    fontFamily: "'Manrope', serif",
    fontWeight: "800",
    fontSize: "18px",
    lineHeight: "22px"
  },
  "& .searchBar":{
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    border: "1px solid #D6DCE1",
    borderRadius: "4px",
    width: "184px",
    height: "32px",
    "& input":{
      padding: "2px 10px",
      fontSize: "12px",
      color: "#757575",
      height:"30px",
      boxSizing: "border-box",
      color:"#212121"
    },
    "& .MuiInputBase-adornedStart":{
      display: "flex",
      flexDirection: "row-reverse",
    },
    "& svg":{
      width:"20px",
      marginRight:"5px"
    }
  },
  "& .toobarRow":{
    minHeight:"54px",
    paddingLeft:"15px",
    paddingRight:"15px"
  },
  "& .settingIcon":{
    padding:"0"
  }
}));

const Header = () => {
  return (
    <MainAppBar>
      <Toolbar className='toobarRow'>
        <Typography variant="h6">
          Resource Allocation
        </Typography>
        <Box display={'flex'} alignItems={'center'} ml={'auto'} gap={'20px'}>
          <Box className="searchBar">
            <TextField
              placeholder="Search"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              variant="standard"
            />
          </Box>
          <IconButton className='settingIcon'>
          <img src={"/images/icons/help-icon.svg"} alt='' width={22} />
          </IconButton>
          <IconButton className='settingIcon'>
          <img src={"/images/icons/setting.svg"} alt='' width={22} />
          </IconButton>
          <Box lineHeight={'10px'}>
            <img src={"/images/icons/profile.svg"} alt='' />
          </Box>
        </Box>
      </Toolbar>
    </MainAppBar>
  );
};

export default Header;
