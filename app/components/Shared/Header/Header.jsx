'use client';
import React, { useState, useEffect } from 'react';
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
  Button,
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
import {
  COMPANY_DEFAULT_VIEW,
  setSplitView,
  setSplitViewCurrentProject,
  updateCurrentView,
} from '@/app/redux/reducers/allocationViewReducer';

const MainAppBar = styled(AppBar, {
  shouldForwardProp: prop => prop !== 'sidebarExpanded',
})(({ theme, sidebarExpanded }) => ({
  marginLeft: sidebarExpanded ? '276px' : '74px',
  width: `calc(100% - ${sidebarExpanded ? '276px' : '74px'})`,
  transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
  zIndex: '91',
  boxShadow: '0 1px 0 0 #DDE1E4',
  background: theme.palette.sideBarColor.main,
  '& h6': {
    color: theme.custom.primaryColor,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '700',
    fontSize: '14px',
    lineHeight: 'normal',
    textTransform: ' uppercase',
    color: '#FFF',
    letterSpacing: '-0.56px',
  },
  '& .toobarRow': {
    minHeight: '30px',
    paddingLeft: '11px',
    paddingRight: '15px',
  },
  '& .settingIcon': {
    padding: '0',
    borderRadius: '5px',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  width: '96px',
  height: '20px',
  padding: '10px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  flexShrink: '0',
  fontWeight: '700',
  fontSize: '12px',
}));

const Header = ({ sidebarExpanded }) => {
  const [openAddMenu, setOpenAddMenu] = React.useState(false);
  const { projects } = useSelector(state => state.projects);
  const { resources } = useSelector(state => state.resources);
  const { user } = useSelector(state => state.user);
  const { splitView } = useSelector(state => state.allocationView);
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
        setDisplayName(
          `${user?.FirstName ?? ''} ${user?.LastName ?? ''}`.trim()
        );
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


  function handleSplitViewDone() {
    dispatch(setSplitView(false));
    dispatch(setSplitViewCurrentProject(null));
    dispatch(updateCurrentView(COMPANY_DEFAULT_VIEW));
  }
  // return focus to the button when we transitioned from !open -> open
  const prevOpenAdd = React.useRef(openAddMenu);

  React.useEffect(() => {
    if (prevOpenAdd.current === true && openAddMenu === false) {
      anchorRefAdd.current.focus();
    }
    prevOpenAdd.current = openAddMenu;
  }, [openAddMenu]);

  const getTitleFromPathname = pathname => {
    switch (pathname) {
      case '/allocation':
        return 'Resource Allocation';
      case '/project':
        return 'Projects';
      case '/people':
        return 'Resources';
      case '/report':
        return 'Reports';
      case '/settings':
        return 'Settings';
      case '/notifications':
        return;
      case '/help':
        return;
      case '/actuals':
        return 'Actuals';
      case '/':
      case '/dashboard':
        return 'Executive Dashboard';
      default:
        return '';
    }
  };
  return (
    <MainAppBar sidebarExpanded={sidebarExpanded}>
      <Toolbar className="toobarRow">
        <Typography variant="h6">
          {pathname === '/actuals' ? (
            <>
              {loadingName ? (
                <Skeleton width={100} height={20} />
              ) : (
                `${displayName} : Actuals`
              )}
            </>
          ) : (
            getTitleFromPathname(pathname)
          )}
        </Typography>
        <Box display="flex" alignItems="center" ml="auto" gap="20px">
          {pathname === '/allocation' && splitView ? (
            <StyledButton variant="contained" onClick={handleSplitViewDone}>
              Close
            </StyledButton>
          ) : null}
        </Box>
      </Toolbar>
    </MainAppBar>
  );
};

export default Header;
