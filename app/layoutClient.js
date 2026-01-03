// app/layoutClient.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, styled } from '@mui/material';
import SideBar from './components/Shared/Sidebar/Sidebar';
import Header from './components/Shared/Header/Header';
import { getToken, getUserId } from './utils/authUtils';
import { PUBLIC_ROUTES } from './constants/constants';
import { getUserData } from './redux/actions/authActions';
import { useDispatch, useSelector } from 'react-redux';
import MuiXLicense from './components/MuiLicence/MuiLicenceKey';
import { CustomSnackbar } from './components/Snackbar/CustomSnackbar';
import { fetchAllTeams } from './redux/actions/fetchTeamsAction';
import { fetchAllProjects } from './redux/actions/fetchProjectsAction';
import { fetchPortfolios } from './services/prorfolioServices';
import { FETCH_PORTFOLIOS } from './redux/actions/portfolioActions';
import { FETCH_ALL_RESOURCES_DETAIL } from './redux/actions/allResourcesDetailAction';
import {
  FETCH_PRIVILEGEASSIGNMENTS,
  FETCH_PRIVILEGES,
  FETCH_ROLES,
  FETCH_ROLESASSIGNMENTS,
  GET_USER_AND_PRIVILEGES,
  SETUP_ADVANCED_FILTERS,
} from './redux/actions/rbacActions';
import { FETCH_ALL_SETTINGS } from './redux/actions/allSettingsActions';

const MainContent = styled(Box, {
  shouldForwardProp: prop => !['isLoggedIn', 'sidebarExpanded'].includes(prop),
})(({ theme, isLoggedIn, sidebarExpanded }) => {
  return {
    background: '#fff',
    marginLeft: isLoggedIn ? (sidebarExpanded ? '276px' : '74px') : '0',
    paddingTop: `${isLoggedIn ? '31px' : '0'}`,
    transition: 'margin-left 0.3s ease-in-out',
  };
});

export default function LayoutClient({ children }) {
  const isLoggedIn = getToken();
  const userId = getUserId();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isUserLoginIn, setIsUserLoginIn] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const { open } = useSelector(state => state.toast);
  const {
    roles,
    roleAssignments,
    privileges,
    privilegeAssignments,
    loginUserPrivileges,
  } = useSelector(state => state.rbac);
  const { resources } = useSelector(state => state.resources);
  const { projects } = useSelector(state => state.projects);
  const { teams } = useSelector(state => state.teams);
  const { portfolios } = useSelector(state => state.portfolios);
  const { scalarSettings } = useSelector(state => state.allSettings);

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getTitleByPath = pathname => {
      switch (pathname) {
        case '/allocation':
          return 'Allocation';
        case '/project':
          return 'Projects';
        case '/people':
          return 'Resources';
        case '/report':
          return 'Reports';
        case '/actuals':
          return 'Actuals';
        case '/settings':
          return 'Settings';
        case '/':
        case '/dashboard':
          return 'Dashboard';
        case '/login':
          return 'Login';
        case '/signup':
          return 'SignUp';
        case '/signup-otp':
          return 'SignUp OTP';
        case '/forgot-password':
          return 'Forgot Password';
        case '/reset-password':
          return 'Reset Password';
        case '/invite':
          return 'Set Password';
        default:
          return 'CIOptimize';
      }
    };
    document.title = getTitleByPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!isClient) return;
    const search = searchParams.toString();
    const fullUrl = search ? `${pathname}?${search}` : pathname;
    const encodedUrl = encodeURIComponent(fullUrl);
    if (isLoggedIn && isPublicRoute) {
      router.replace('/dashboard');
    } else if (
      !isLoggedIn &&
      !isPublicRoute &&
      !pathname.startsWith('/login')
    ) {
      router.replace(`/login?redirect=${encodedUrl}`);
    }
  }, [isLoggedIn, isPublicRoute, router, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (isLoggedIn && userId) {
      setIsUserLoginIn(isLoggedIn);
      // Fetch user data and,
      dispatch(getUserData(userId));
      // Fetch essential login user privileges data
      if (
        !loginUserPrivileges ||
        Object.keys(loginUserPrivileges).length === 0
      ) {
        dispatch({ type: GET_USER_AND_PRIVILEGES, payload: { userId } });
      }

      // Fetch All Settings
      if (scalarSettings === null) {
        dispatch({
          type: FETCH_ALL_SETTINGS,
          payload: {},
        });
      }

      // Fetch essential data for the app
      if (!teams?.length) {
        dispatch(fetchAllTeams());
      }
      if (!projects?.length) {
        dispatch(fetchAllProjects());
      }
      if (!resources?.length) {
        dispatch({
          type: FETCH_ALL_RESOURCES_DETAIL,
          payload: {},
        });
      }
      if (!portfolios?.length) {
        dispatch({
          type: FETCH_PORTFOLIOS,
          payload: {},
        });
      }
      if (!roles?.length) {
        dispatch({ type: FETCH_ROLES });
      }
    }
  }, [dispatch, isLoggedIn, isClient]);

  useEffect(() => {
    if (!isClient || !isLoggedIn || !userId) return;
    if (
      loginUserPrivileges &&
      Object.keys(loginUserPrivileges).length &&
      resources.length
    ) {
      dispatch({
        type: SETUP_ADVANCED_FILTERS,
        payload: {
          loginUserPrivileges,
          userId,
          resources,
          projects,
          teams,
        },
      });
    }
  }, [dispatch, isLoggedIn, isClient, userId, loginUserPrivileges, resources]);

  if (!isClient) return null;
  if (!isLoggedIn && !isPublicRoute) return null;

  return (
    <>
      {!isPublicRoute && (
        <Header
          isExpanded={sidebarExpanded}
          sidebarExpanded={sidebarExpanded}
          toggleSidebar={() => setSidebarExpanded(prev => !prev)}
        />
      )}
      {!isPublicRoute && (
        <SideBar
          sidebarExpanded={sidebarExpanded}
          toggleSidebar={() => setSidebarExpanded(prev => !prev)}
        />
      )}
      <MainContent isLoggedIn={isUserLoginIn} sidebarExpanded={sidebarExpanded}>
        {children}
        {open && <CustomSnackbar sidebarExpanded={sidebarExpanded} />}
      </MainContent>
      <MuiXLicense />
    </>
  );
}
