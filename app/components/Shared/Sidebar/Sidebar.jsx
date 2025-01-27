"use client";
import { List, ListItem, ListItemIcon, ListItemText, styled } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import styles from './Sidebar.module.css';

const MenuItem = styled(ListItem)({
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: 'white',
  '&:hover': {
    backgroundColor: '#0057a4',
  },
});

const Sidebar = () => {
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
            <ListItemIcon style={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </MenuItem>
        ))}
      </List>
    </div>
  );
};

export default Sidebar;
