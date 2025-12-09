// app/layoutClient.js
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, styled } from '@mui/material';
import SideBar from './components/Shared/Sidebar/Sidebar';
import Header from './components/Shared/Header/Header';
import { getToken, getUserId } from './utils/authUtils';
import { PUBLIC_ROUTES } from './constants/constants';
import { useDispatch, useSelector } from 'react-redux';
import MuiXLicense from './components/MuiLicence/MuiLicenceKey';
import { CustomSnackbar } from './components/Snackbar/CustomSnackbar';
import { FETCH_ALL_SETTINGS } from './redux/actions/allSettingsActions';
import { INIT_BOOTSTRAP } from './redux/actions/authActions';
import { SETUP_ADVANCED_FILTERS } from './redux/actions/rbacActions';
import { setLoadingAdvancedFilters } from './redux/reducers/dashboardReducer';

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
  const initLoading = useSelector(state => state.user.initLoading);

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
      // Dispatch the bootstrap saga which handles all initial data fetching
      // and sets initLoading to false when all data is fetched
      dispatch({ type: INIT_BOOTSTRAP, payload: { userId } });
    }
  }, [dispatch, isLoggedIn, isClient]);

  useEffect(() => {
    if (!isClient || !isLoggedIn || !userId) return;
    if (
      !initLoading &&
      loginUserPrivileges &&
      Object.keys(loginUserPrivileges).length &&
      resources?.length
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
  }, [
    dispatch,
    isLoggedIn,
    isClient,
    userId,
    loginUserPrivileges,
    resources,
    initLoading,
  ]);

  useEffect(() => {
    if (!isClient || !isLoggedIn || !userId) return;
    // After initial loading is done, if user has no resources, we can stop
    // loading advanced filters as there are no resources to filter on
    // with a slight delay to ensure any sagas have completed
    setTimeout(() => {
      if (!initLoading && !resources?.length) {
        dispatch(setLoadingAdvancedFilters(false));
      }
    }, 4000);
  }, [initLoading, resources]);

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
