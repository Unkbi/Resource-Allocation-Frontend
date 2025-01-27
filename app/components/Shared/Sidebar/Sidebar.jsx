"use client";
import React, { useContext } from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import './sidebar.css';
// import { ThemeContext } from '../../../theme/ThemeRegistry';

const Sidebar = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Allocation', icon: <DashboardIcon /> },
    { text: 'Projects', icon: <DashboardIcon /> },
    { text: 'People', icon: <PeopleIcon /> },
    { text: 'Reports', icon: <BarChartIcon /> },
  ];

  // const { toggleMode, changePrimaryColor, changeFontSize, mode, primaryColor, fontSize } =
  //   useContext(ThemeContext);


  return (
    <div className="sidebar">
      <List>
        {menuItems.map((item, index) => (
          <ListItem button key={index} className="menu-item">
            <ListItemIcon style={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;