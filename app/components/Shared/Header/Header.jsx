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
import AddIcon from '@mui/icons-material/Add'; // Add icon import
import CloseIcon from '@mui/icons-material/Close'; // Close icon import



const MainAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'shrinkSearchBar', // Prevent passing 'shrinkSearchBar' to the DOM
})(({ theme, shrinkSearchBar }) => ({
  marginLeft: "74px",
  width: "calc(100% - 74px)",
  zIndex: "91",
  boxShadow: "0 1px 0 0 #DDE1E4",
  background: "#EBEFFC",
  "& h6": {
    color: theme.custom.primaryColor,
    fontFamily: "'Manrope', serif",
    // fontFamily: "Open Sans",
    fontWeight: "SemiBold",
    fontSize: "18px",
    lineHeight: "22px"
  },
  "& .searchBar": {
    backgroundColor: "#FFFFFF",
    border: "1px solid #D6DCE1",
    boxShadow: "0 1px 0 0 #DDE1E4",
    borderRadius: "4px",
    width:  shrinkSearchBar ?"220px":"445px",
    height: "32px",
    transition: "width 0.3s ease-in-out", 
    "& input": {
      padding: "2px 10px",
      fontSize: "12px",
      color: "#757575",
      width: shrinkSearchBar ?"180px" :"410px",
      // height: "32px",
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
    padding: "0",
    borderRadius: "inherit",
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
  const [openAddMenu, setOpenAddMenu] = React.useState(false);
  const [shrinkSearchBar, setShrinkSearchBar] = React.useState(false); 
  const anchorRefAdd = React.useRef(null);
  const anchorRef = React.useRef(null);
  const anchorsearchBarRef =  React.useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleAddMenuToggle = () => {
    setOpenAddMenu((prevOpen) => !prevOpen);
    setOpen(false);
    setShrinkSearchBar((prevShrink) => !prevShrink)
  };
  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target) || anchorRefAdd.current?.contains(event.target)) {
      return;
    }
    setOpen(false);
    setOpenAddMenu(false);
    setShrinkSearchBar(false);
  
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
      setOpenAddMenu(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setOpenAddMenu(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  const prevOpenAdd = React.useRef(openAddMenu);

  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  React.useEffect(() => {
    if (prevOpenAdd.current === true && openAddMenu === false) {
      anchorRefAdd.current.focus();
    }
    prevOpenAdd.current = openAddMenu;
  }, [openAddMenu]);

  const handleLogout = (e) => {
    dispatch(performLogout())
    router.push("/login");
  }

  const { FirstName, LastName } = user || {};
  return (
    <MainAppBar shrinkSearchBar={shrinkSearchBar}>
      <Toolbar className='toobarRow'>
        <Typography variant="h6">
        Executive Dashboard
        </Typography>
        <Box display={'flex'} alignItems={'center'} ml={'auto'} gap={'20px'}>
          <Box className="searchBar">
            <TextField
              placeholder="Search..."
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
          {/* <IconButton className='settingIcon'>
            <img src={"/images/icons/help-icon.svg"} alt='' width={22} />
          </IconButton>
          <IconButton className='settingIcon'>
            <img src={"/images/icons/setting.svg"} alt='' width={22} />
          </IconButton> */}

          <IconButton className="settingIcon" 
          onClick={handleAddMenuToggle} 
          ref={anchorRefAdd}
          sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "25px",          
          height: "25px",        
          backgroundColor: "#0A1B39",   
          borderRadius: "50%", 
          '&:hover': {
          backgroundColor: "#0A1B39", // Keep the color consistent on hover
         },
         '&:focus': {
         backgroundColor: "#0A1B39", // Keep the color consistent on focus
          },
          }}>
  {/* Toggle the icon here based on the openAddMenu state */}
          {openAddMenu ? (
          <CloseIcon sx={{ color: '#fff', width: 22, height: 30 }} />
          ) : (
          // <AddIcon sx={{ color: '#fff', width: 22, height: 22 }} />
          <img src={"/images/icons/addbutton.svg"} alt='' width={30} />
          )}
         </IconButton>
          {/* <Box lineHeight={'10px'}
            onClick={handleToggle}
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            sx={{ cursor: 'pointer' }}
          >
            <Typography variant="h4" className="profileLogo">
              {`${FirstName?.[0] || ""}${LastName?.[0] || ""}`.toUpperCase()}
            </Typography> */}
            {/* <img src={"/images/icons/profile.svg"} alt='' /> */}
          {/* </Box> */}
        </Box>
      </Toolbar>
      <Popper
        open={open}
        anchorEl={anchorsearchBarRef.current}
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

      <Popper
        open={openAddMenu}
        anchorEl={anchorRefAdd.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper className="AddMenu">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={openAddMenu}
                  id="Add-menu"
                  aria-labelledby="Add-button"
                  onKeyDown={handleListKeyDown}
                  sx={{gap:"8px" ,margin:" 5px",
                    padding:" 2px",paddingTop:"18px",paddingBottom:"12px",}}
                >
              <MenuItem sx={{ display: 'flex', alignItems: 'center', paddingLeft: '12px',paddingBottom:"14px",gap:"8px", }}>
              <img src="/images/icons/AllocationIcon.svg" alt="Allocation Icon" width={20} style={{ marginRight: '8px' }} />
              Add Allocation
            </MenuItem>
            <MenuItem sx={{ display: 'flex', alignItems: 'center', paddingLeft: '12px',paddingBottom:"14px",gap:"8px" ,}}>
              <img src="/images/icons/ProjectIcon.svg" alt="Project Icon" width={20} style={{ marginRight: '8px' }} />
              Add Project
            </MenuItem>
            <MenuItem sx={{ display: 'flex', alignItems: 'center', paddingLeft: '12px',paddingBottom:"14px",gap:"8px" }}>
              <img src="/images/icons/TeamIcon.svg" alt="Team Icon" width={20} style={{ marginRight: '8px' }} />
              Add Team
            </MenuItem>
            <MenuItem sx={{ display: 'flex', alignItems: 'center', paddingLeft: '12px',paddingBottom:"14px" ,gap:"8px"}}>
              <img src="/images/icons/ResourceIcon.svg" alt="Resource Icon" width={20} style={{ marginRight: '8px' }} />
              Add Resource
            </MenuItem>
            <MenuItem sx={{ display: 'flex', alignItems: 'center', paddingLeft: '12px' ,paddingBottom:"14px",gap:"8px"}}>
              <img src="/images/icons/corporate_fare.svg" alt="Resource Icon" width={20} style={{ marginRight: '8px' }} />
              Add Organiztion
            </MenuItem>
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
