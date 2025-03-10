"use client";
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, TextField, InputAdornment, styled, Box, colors } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { performLogout } from '@/app/redux/actions/authActions';


const MainAppBar = styled(AppBar)(({ theme }) => ({
  marginLeft: "74px",
  width: "calc(100% - 74px)",
  zIndex: "91",
  boxShadow: "0 1px 0 0 #DDE1E4",
  background: "#fff",
  "& h6": {
    color: theme.custom.primaryColor,
    fontFamily: "'Manrope', serif",
    fontWeight: "800",
    fontSize: "18px",
    lineHeight: "22px"
  },
  "& .searchBar": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    border: "1px solid #D6DCE1",
    borderRadius: "4px",
    width: "184px",
    height: "32px",
    "& input": {
      padding: "2px 10px",
      fontSize: "12px",
      color: "#757575",
      height: "30px",
      boxSizing: "border-box",
      color: "#212121"
    },
    "& .MuiInputBase-adornedStart": {
      display: "flex",
      flexDirection: "row-reverse",
    },
    "& svg": {
      width: "20px",
      marginRight: "5px"
    }
  },
  "& .toobarRow": {
    minHeight: "54px",
    paddingLeft: "15px",
    paddingRight: "15px"
  },
  "& .settingIcon": {
    padding: "0"
  },
  "& .profileLogo":{
    backgroundColor: "#1c2d5f",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    lineHeight: "21px",
    color: "#fff",
    paddingTop:"0px"
  },
  "& .profileMenu":{
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
    marginTop: "16px",
    minWidth: "160px",
    "& li":{
      fontFamily: "'Manrope', serif",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "22px",
      color:"#212121",
      "& .MuiTouchRipple-root":{
        display:"none"
      },
      "&.Mui-focusVisible":{
        backgroundColor: '#FFFFFF',
      }
    }
  }
}));

const Header = () => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event) {
    console.log("Handle List Key Down : event.key", event.key);
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleLogout = (e) => {
    dispatch(performLogout())
    router.push("/login");
  }

  const { FirstName, LastName } = user || {};
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
          <Box lineHeight={'10px'}
            onClick={handleToggle}
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="h4" className="profileLogo">
              {`${FirstName?.[0] || ""}${LastName?.[0] || ""}`.toUpperCase()}
            </Typography>
            {/* <img src={"/images/icons/profile.svg"} alt='' /> */}
          </Box>
        </Box>
      </Toolbar>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper className="profileMenu">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </MainAppBar>
  );
};

export default Header;
