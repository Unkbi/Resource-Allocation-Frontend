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
    padding: "10px 8px",
    marginBottom: "5px",
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
    marginBottom: "20px"
  }
}));

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { text: 'Dashboard', icon: "/images/icons/dashboard.svg", url: "" },
    { text: 'Allocation', icon: "/images/icons/allocation.svg", url: "/allocation" },
    { text: 'Projects', icon: "/images/icons/projects.svg", url: "" },
    { text: 'People', icon: "/images/icons/people.svg", url: "" },
    { text: 'Reports', icon: "/images/icons/reports.svg", url: "" },
  ];

  useEffect(() => {
    const currentMenuItem = menuItems.find(item => item.url === pathname);
    if (currentMenuItem) {
      setSelectedMenu(currentMenuItem.text);
    }
  }, [pathname]);

  const handleMenuClick = (text, url) => {
    setSelectedMenu(text);
    router.push(url);
  };

  return (
    <MainBox>
      <Box className='logo'>
        <Link href={''}>
          <img alt="logo" src="/images/icons/cio-logo.svg" />
        </Link>
      </Box>
      <List>
        {menuItems.map((item, index) => (
          <MenuItem
            className={`menuList ${selectedMenu === item.text ? 'active' : ''}`}
            key={index}
            onClick={() => handleMenuClick(item.text, item.url)}
          >
            <img src={item.icon} alt={item.text} />
            <Typography className='menuText'>{item.text}</Typography>
          </MenuItem>
        ))}
      </List>
    </MainBox>
  );
};

export default Sidebar;
