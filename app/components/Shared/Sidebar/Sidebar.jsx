"use client";
import { useEffect, useState,useRef } from "react";
import { Box, List, MenuItem, styled, Typography } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";
import { useDispatch, useSelector } from 'react-redux';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import { performLogout } from '@/app/redux/actions/authActions';

const MainBox = styled(Box)(({ theme }) => ({
  width: "74px",
  position: "fixed",
  left: "0",
  top: "0",
  backgroundColor: theme.custom.bgColor,
  height: "100vh",
  color: theme.custom.secondryColor,
  paddingTop: "10px",
  textAlign: "center",
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  "& .menuList": {
    flexDirection: "column",
    padding: "0",
    alignItems: "center",
    opacity: "0.6",
    padding: "8px 2px",
    cursor: "pointer",
    "&.active": {
      opacity: "1",
      backgroundColor: theme.custom.ternaryColor,
      margin :"7px",
      borderRadius :"4px",
      
    }
  },
  "& .logo": {
    paddingTop: "4px",    
  },
  "& .profle-img": {
    width: "40px",
    height: "40px",
  },
  "& .items-parent": {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%", 
  },
  "& .menuList img": {
    width: "24px", 
    height: "24px", 
  },
  "& .profileMenu": {
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
    marginTop: "16px",
    minWidth: "160px",
    "& li": {
      fontFamily: "'Manrope', serif",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "22px",
      color: "#212121",
      "& .MuiTouchRipple-root": {
        display: "none"
      },
      "&.Mui-focusVisible": {
        backgroundColor: '#FFFFFF',
      }
    }
  }
}));


const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState('allocation');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) {
      return;
    }
    setOpen(false);
  
  };
  
  const prevOpen = useRef(open);
  
  useEffect(() => {
      if (prevOpen.current === true && open === false) {
        anchorRef.current.focus();
      }
      prevOpen.current = open;
      }, [open]);
  
  const handleLogout = () => {
        dispatch(performLogout())
        router.push("/login");
      }

const menuItems = [
    {icon: "/images/icons/DashboardRounded.svg", url: "/", disabled: false },
    {icon: "/images/icons/WatchLaterRoundedd.svg", url: "/allocation", disabled: false },
    {icon: "/images/icons/FolderFileOpen.svg", url: "/project", disabled: false },
    {icon: "/images/icons/SupervisedUserCircleRounded.svg", url: "/people", disabled: true },
    {icon: "/images/icons/PollRounded.svg", url: "/report", disabled: true },
  ];

  const extraMenuItems = [
    { icon: "/images/icons/SettingsIcon.svg", url: "/settings", disabled: true }, 
    { icon: "/images/icons/Notifications.svg", url: "/notifications", disabled: true }, 
    { icon: "/images/icons/helpIcon.svg", url: "/help", disabled: true },
    { icon: "/images/icons/sidebar-left.svg", url: "/expand", disabled: true },
  ];


  useEffect(() => {
    const currentMenuItem = [...menuItems, ...extraMenuItems].find(item => item.url === pathname);
    if (currentMenuItem) {
      setSelectedMenu(currentMenuItem.url);
    }
  }, [pathname]);

  const handleMenuClick = (url, disabled) => {
    if (disabled) return; 
    setSelectedMenu(url);
    router.push(url);
  };

  return (
    <MainBox className="main-parent">
      <Box className='logo' >
        <Link href={''}>
          <img alt="logo" src="/images/icons/cio-logo.svg" />
        </Link>
        <img src="/images/icons/Line1.svg"/>
      </Box>
      <Box className= "items-parent">
        <Box className= "items-parent-wrapper">
          <Box className="menu-items-parent">
      <List>
        {menuItems.map((item, index) => (
          <MenuItem
            className={`menuList ${selectedMenu === item.url ? 'active' : ''}`}
            key={index}
                onClick={() => handleMenuClick(item.url, item.disabled)}
                sx={{
                  opacity: item.disabled ? 0.5 : 1,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <img src={item.icon} alt={item.text} />
              </MenuItem>
            ))}
          </List>
        </Box>

        <Box className="line-container" sx={{marginTop:"-20px"}}>
      <img src="/images/icons/Line2.svg"/>
      </Box>
      </Box>
      
      <Box  className= "extra-menuitems-parent" sx={{ marginTop: '4px', paddingTop: '20px' }}>
        <List>
          {extraMenuItems.map((item, index) => (
            <MenuItem
              className={`menuList ${selectedMenu === item.url ? 'active' : ''}`}
              key={index}
              onClick={() => handleMenuClick(item.url, item.disabled)}
                sx={{
                  opacity: item.disabled ? 0.5 : 1,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <img src={item.icon} alt={item.text} sx={{ width: '16px', height: '16px' }} />
              </MenuItem>
            ))}
          </List>
          <Box lineHeight={'10px'}
            onClick={handleToggle}
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            sx={{ cursor: 'pointer' ,marginBottom:"9px" }}
          >
            <img src={"/images/icons/profile.svg"} className="profle-img" alt='' />
          </Box>
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
      <img src="/images/icons/exiticon.svg" alt="Exit" sx={{paddingTop:"2px"}}/>
      </Box>
      </Box>
    </MainBox>
  );
};

export default Sidebar;
