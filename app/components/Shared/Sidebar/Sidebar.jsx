"use client";
import { List, ListItem, ListItemIcon, ListItemText, styled, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import styles from './Sidebar.module.css';
import { ThemeContext } from '../../../theme/ThemeRegistry';
import { useContext } from 'react';
import { useTheme } from '@mui/material/styles';

const MenuItem = styled(ListItem)(({ theme }) => ({
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: 'white',
  '&:hover': {
    backgroundColor: theme.custom.hoverBackground,
  },
}));

const Sidebar = () => {
  // const theme = useTheme();
  // const { mode } = useContext(ThemeContext);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Allocation', icon: <DashboardIcon /> },
    { text: 'Projects', icon: <DashboardIcon /> },
    { text: 'People', icon: <PeopleIcon /> },
    { text: 'Reports', icon: <BarChartIcon /> },
  ];

  return (
    <div className={styles.sidebar}>
      <List>
        {menuItems.map((item, index) => (
          <MenuItem key={index}>
            <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <Typography>
              {item.text}
            </Typography>
            {/* <ListItemText primary={item.text} /> */}
          </MenuItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
