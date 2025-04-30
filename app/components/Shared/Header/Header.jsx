'use client';
import React, { useState,useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  styled,
  Box,
  colors,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close'; // Close icon import
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import AllocationForm from '../../AllocationTable/components/AllocationForm';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import Skeleton from '@mui/material/Skeleton';

const MainAppBar = styled(AppBar, {
  shouldForwardProp: prop => prop !== 'sidebarExpanded',
})(({ theme, sidebarExpanded }) => ({
  marginLeft: sidebarExpanded ? '276px' : '74px',
  width: `calc(100% - ${sidebarExpanded ? '276px' : '74px'})`,
  transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
  zIndex: '91',
  boxShadow: '0 1px 0 0 #DDE1E4',
  background: '#EBEFFC',
  '& h6': {
    color: theme.custom.primaryColor,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'SemiBold',
    fontSize: '18px',
    lineHeight: '22px',
  },
  '& .searchBar': {
    backgroundColor: '#FFFFFF',
    border: '1px solid #D6DCE1',
    boxShadow: '0 1px 0 0 #DDE1E4',
    borderRadius: '4px',
    width: '445px',
    height: '33px',
    transition: 'width 0.3s ease-in-out',
    '& input': {
      padding: '2px 10px',
      fontSize: '12px',
      color: '#757575',
      width: '410px',
      // height: "32px",
      height: '30px',
      boxSizing: 'border-box',
      color: '#212121',
    },
    '& .MuiInputBase-adornedStart': {
      display: 'flex',
      flexDirection: 'row-reverse',
    },
    '& svg': {
      width: '20px',
      marginRight: '5px',
    },
  },
  '& .toobarRow': {
    minHeight: '54px',
    paddingLeft: '15px',
    paddingRight: '15px',
  },
  '& .settingIcon': {
    padding: '0',
    borderRadius: '5px',
  },
}));

const Header = ({ sidebarExpanded }) => {
  const [openAddMenu, setOpenAddMenu] = React.useState(false);
  const { projects } = useSelector(state => state.projects);
  const { resources } = useSelector(state => state.resources);
  const { user } = useSelector(state => state.user);
  const anchorRefAdd = React.useRef(null);
  const anchorRef = React.useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [displayName, setDisplayName] = useState('');
  const [loadingName, setLoadingName] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
    if (user?.FirstName || user?.LastName) {
    setDisplayName(`${user?.FirstName ?? ''} ${user?.LastName ?? ''}`.trim());
    } else {
    setDisplayName('User');
    }
    setLoadingName(false);
   }, 3000);
   return () => clearTimeout(timer);
   }, [user]);

  useEffect(() => {
    if (projects === null) {
      dispatch(fetchAllProjects());
    }
    if (resources === null) {
      dispatch(fetchAllResources());
    }
  }, [projects, resources]);

  const handleAddMenuToggle = () => {
    setOpenAddMenu(prevOpen => !prevOpen);
  };
  const handleClose = event => {
    if (
      anchorRef.current?.contains(event.target) ||
      anchorRefAdd.current?.contains(event.target)
    ) {
      return;
    }
    setOpenAddMenu(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab' || event.key === 'Escape') {
      event.preventDefault();
      setOpenAddMenu(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpenAdd = React.useRef(openAddMenu);

  React.useEffect(() => {
    if (prevOpenAdd.current === true && openAddMenu === false) {
      anchorRefAdd.current.focus();
    }
    prevOpenAdd.current = openAddMenu;
  }, [openAddMenu]);

  const menuItems = [
    {
      icon: '/images/icons/AllocationIcon.svg',
      alt: 'Allocation Icon',
      title: 'Update Allocation',
      type: 'add_allocation',
    },
    {
      icon: '/images/icons/ProjectIcon.svg',
      alt: 'Project Icon',
      title: 'Add Project',
      type: 'add_project',
      initialData: {
        Status: 'Active',
      },
    },
    {
      icon: '/images/icons/TeamIcon.svg',
      alt: 'Team Icon',
      title: 'Add Team',
      type: 'add_team',
    },
    {
      icon: '/images/icons/ResourceIcon.svg',
      alt: 'Resource Icon',
      title: 'Add Resource',
      type: 'add_resource',
    },
    {
      icon: '/images/icons/corporate_fare.svg',
      alt: 'Organization Icon',
      title: 'Add Organization',
      type: 'add_organization',
    },
  ];

  const handleOpenDialog = (title, formType, initialData = null) => {
    setOpenAddMenu(false);
    dispatch(
      openDialog({
        title: title,
        submitButtonText: formType === 'add_allocation' ? 'Update' : 'Add',
        cancelButtonText: 'Cancel',
        secondryText: 'Save As',
        formType: formType,
        initialData: initialData,
      })
    );
  };

  const getTitleFromPathname = pathname => {
    switch (pathname) {
      case '/allocation':
        return 'Resource Allocation';
      case '/project':
        return 'Projects';
      case '/people':
        return 'Resource';
      case '/report':
        return 'Reports';
      case '/settings':
        return 'Settings';
      case '/notifications':
        return;
      case '/help':
        return;
      case '/actual':
        return "Actuals" ;
      default:
        return 'Executive Dashboard';
    }
  };
  return (
    <MainAppBar sidebarExpanded={sidebarExpanded}>
      <Toolbar className="toobarRow">
        <Typography variant="h6"> 
        {pathname === '/actual' ? (
        <>  
        {loadingName ? (
        <Skeleton width={100} height={20} />
         ) : (
        `${displayName} : Actuals`
        )}
       </>
        ) : (getTitleFromPathname(pathname))}
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

          <IconButton
            className="settingIcon"
            onClick={handleAddMenuToggle}
            ref={anchorRefAdd}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              backgroundColor: '#0A1B39',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#0A1B39',
              },
              '&:focus': {
                backgroundColor: '#0A1B39',
              },
            }}
          >
            {/* Toggle the icon here based on the openAddMenu state */}
            {openAddMenu ? (
              <CloseIcon sx={{ color: '#fff', width: 22, height: 30 }} />
            ) : (
              <img src={'/images/icons/addbutton.svg'} alt="" width={30} />
            )}
          </IconButton>
        </Box>
      </Toolbar>

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
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper
              className="AddMenu"
              sx={{
                boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06)',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={openAddMenu}
                  id="Add-menu"
                  aria-labelledby="Add-button"
                  onKeyDown={handleListKeyDown}
                  sx={{
                    gap: '8px',
                    margin: ' 5px',
                    paddingTop: '18px',
                    paddingBottom: '12px',
                  }}
                >
                  {menuItems.map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() =>
                        handleOpenDialog(
                          item.title,
                          item.type,
                          item.initialData
                        )
                      }
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 2,
                        paddingBottom: 2,
                        gap: 1,
                      }}
                    >
                      <img
                        src={item.icon}
                        alt={item.alt}
                        width={20}
                        style={{ marginRight: 8 }}
                      />
                      {item.title}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <AllocationForm />
    </MainAppBar>
  );
};

export default Header;
