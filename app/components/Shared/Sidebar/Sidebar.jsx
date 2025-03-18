"use client";
import { useEffect, useState } from "react";
import { Box, List, MenuItem, styled, Typography } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import Link from "next/link";

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
  "& .menuList": {
    flexDirection: "column",
    padding: "0",
    alignItems: "center",
    opacity: "0.6",
    padding: "8px 2px",
    // marginBottom: "6px",
    cursor: "pointer",
    "&.active": {
      opacity: "1",
      backgroundColor: theme.custom.ternaryColor
    }
  },
  "& .menuText": {
    fontSize: "11px",
    display: "block",
    width: "100%",
    fontFamily: "'Manrope', serif",
    fontWeight: "500",
    textAlign: "center",
    marginTop: "10px",
    lineHeight: "12px",
  },
  "& .logo": {
    marginBottom: "12px"
  }
}));

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { text: '', icon: "/images/icons/Vector.svg", url: "/" },
    { text: '', icon: "/images/icons/WatchLaterRounded.svg", url: "/allocation" },
    { text: '', icon: "/images/icons/FolderIcon.svg", url: "/project" },
    { text: '', icon: "/images/icons/peopleIcon.svg", url: "/people" },
    { text: '', icon: "/images/icons/ReportsIcon.svg", url: "/report" },
  ];

  const extraMenuItems = [
    { text: '', icon: "/images/icons/SettingsIcon.svg", url: "" },
    { text: '', icon: "/images/icons/Notifications.svg", url: "" },
    { text: '', icon: "/images/icons/helpIcon.svg", url: "" },
    { text: '', icon: "/images/icons/sidebar-left.svg", url: "" },
    { text: '', icon: "/images/icons/exiticon.svg", url: "" },
  ];


  useEffect(() => {
    const currentMenuItem = menuItems.find(item => item.url === pathname);
    if (currentMenuItem) {
      setSelectedMenu(currentMenuItem.url);
    }
  }, [pathname]);

  const handleMenuClick = (text, url) => {
    setSelectedMenu(url);
    router.push(url);
  };

  return (
    <MainBox>
      <Box className='logo'>
        <Link href={''}>
          <img alt="logo" src="/images/icons/cio-logo.svg" />
        </Link>
        <img src="/images/icons/Line1.svg"/>
      </Box>
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
      <img src="/images/icons/Line2.svg"/>
      {/* Extra Menu Items (New items) */}
      <Box sx={{ marginTop: '120px', paddingTop: '20px' }}>
        <List>
          {extraMenuItems.map((item, index) => (
            <MenuItem
              className={`menuList ${selectedMenu === item.text ? 'active' : ''}`}
              key={index}
              onClick={() => handleMenuClick(item.text, item.url)}
              aria-label={item.text}
            >
              <img src={item.icon} alt={item.text} />
              <Typography className='menuText'>{item.text}</Typography>
            </MenuItem>
          ))}
        </List>
      </Box>
    </MainBox>
  );
};

export default Sidebar;
