"use client";
import { Box, List, MenuItem, styled, Typography } from '@mui/material';

const MainBox = styled(Box)(({ theme }) => ({
  width: "74px",
  position:"fixed",
  left:"0",
  top:"0",
  backgroundColor: theme.custom.bgColor,
  height: "100vh",
  position: "fixed",
  color: theme.custom.secondryColor,
  paddingTop: "10px",
  textAlign:"center",
  "& .menuList":{
    flexDirection:"column",
    padding: "0",
    alignItems: "center",
    opacity:"0.6",
    padding:"10px 8px",
    marginBottom:"5px",
    "&.active":{
      opacity:"1",
      backgroundColor:theme.custom.ternaryColor
    }
  },
  "& .menuText":{
    fontSize:"11px",
    display:"block",
    width:"100%",
    fontFamily: "'Manrope', serif",
    fontWeight: "500",
    textAlign:"center",
    marginTop:"10px",
    lineHeight:"12px",
  },
  "& .logo":{
    marginBottom:"20px"
  }
}));

const Sidebar = () => {
  // const theme = useTheme();
  // const { mode } = useContext(ThemeContext);
  const DashboardIcon=()=><img src="/images/icons/dashboard.svg" alt="Dashboard"  />
  const AllocationIcon=()=><img src="/images/icons/allocation.svg" alt="allocation"/>
  const ProjectsIcon=()=><img src="/images/icons/projects.svg" alt="projects" />
  const PeopleIcon=()=><img src="/images/icons/people.svg" alt="people" />
  const ReportsIcon=()=><img src="/images/icons/reports.svg" alt="reports" />
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />},
    { text: 'Allocation', icon: <AllocationIcon /> },
    { text: 'Projects', icon: <ProjectsIcon /> },
    { text: 'People', icon: <PeopleIcon /> },
    { text: 'Reports', icon: <ReportsIcon /> },
  ];

  return (
    <MainBox>
      <Box className='logo'>
        <a href='#'>
        <img
          alt=""
          src={"/images/icons/cio-logo.svg"}
        />
        </a>
      </Box>
      <List>
        {menuItems.map((item, index) => (
          <MenuItem className='menuList' key={index}>
            {item.icon}
            <Typography className='menuText'>
              {item.text}
            </Typography>
          </MenuItem>
        ))}
      </List>
    </MainBox>
  );
};

export default Sidebar;
