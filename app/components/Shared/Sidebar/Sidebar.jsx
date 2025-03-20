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
      backgroundColor: theme.custom.ternaryColor
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
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
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
    {icon: "/images/icons/Vector.svg", url: "/" },
    {icon: "/images/icons/WatchLaterRounded.svg", url: "/allocation" },
    {icon: "/images/icons/FolderIcon.svg", url: "/project" },
    {icon: "/images/icons/peopleIcon.svg", url: "/people" },
    {icon: "/images/icons/ReportsIcon.svg", url: "/report" },
  ];

  const extraMenuItems = [
    { text: '', icon: "/images/icons/SettingsIcon.svg", url: "/settings" },
    { text: '', icon: "/images/icons/Notifications.svg", url: "/notifications" },
    { text: '', icon: "/images/icons/helpIcon.svg", url: "/help" },
    { text: '', icon: "/images/icons/sidebar-left.svg", url: "/expand" },
    // { text: '', icon: "/images/icons/exiticon.svg", url: "" },
  ];


  useEffect(() => {
    const currentMenuItem = [...menuItems, ...extraMenuItems].find(item => item.url === pathname);
    if (currentMenuItem) {
      setSelectedMenu(currentMenuItem.url);
    }
  }, [pathname]);

  const handleMenuClick = (text, url) => {
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
        <Box className= "test-parent">
     <Box className="menu-items-parent">
      <List>
        {menuItems.map((item, index) => (
          <MenuItem
            className={`menuList ${selectedMenu === item.url ? 'active' : ''}`}
            key={index}
            onClick={() => handleMenuClick(item.text, item.url)}
          >
            <img src={item.icon} alt={item.text} />
            <Typography className='menuText'>{item.text}</Typography>
          </MenuItem>
        ))}
      </List>
      </Box>
      <Box className="line-container" sx={{marginTop:"-20px"}}>
      <img src="/images/icons/Line2.svg"/>
      </Box>
      </Box>
      {/* Extra Menu Items (New items) */}
      <Box  className= "extra-menuitems-parent" sx={{ marginTop: '4px', paddingTop: '20px' }}>
        <List>
          {extraMenuItems.map((item, index) => (
            <MenuItem
              className={`menuList ${selectedMenu === item.url ? 'active' : ''}`}
              key={index}
              onClick={() => handleMenuClick(item.text, item.url)}
              aria-label={item.text}
            >
              <img src={item.icon} alt={item.text} sx={{ width: '16px', height: '16px' }} />
              <Typography className='menuText'>{item.text}</Typography>
            </MenuItem>
          ))}
        </List>
          <Box lineHeight={'10px'}
            onClick={handleToggle}
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? 'composition-menu' : undefined}
            sx={{ cursor: 'pointer' ,marginBottom:"15px" }}
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
