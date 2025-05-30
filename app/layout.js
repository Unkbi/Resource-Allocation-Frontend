'use client';
import { useEffect, useState } from 'react';
import './styles/globals.css';
import StoreProvider from './StoreProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from './theme/ThemeRegistry';
import SideBar from './components/Shared/Sidebar/Sidebar';
import Header from './components/Shared/Header/Header';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Box, styled } from '@mui/material';
import { getToken } from './utils/authUtils';
import { PUBLIC_ROUTES } from './constants/constants';
import { getUserData } from './redux/actions/authActions';
import { useDispatch, useSelector } from 'react-redux';
import MuiXLicense from './components/MuiLicence/MuiLicenceKey';
import { CustomSnackbar } from './components/Snackbar/CustomSnackbar';

const MainContent = styled(Box, {
  shouldForwardProp: prop => !['isLoggedIn', 'sidebarExpanded'].includes(prop),
})(({ theme, isLoggedIn, sidebarExpanded }) => {
  return {
    background: '#fff',
    marginLeft: isLoggedIn ? (sidebarExpanded ? '276px' : '74px') : '0',
    paddingTop: `${isLoggedIn ? '52px' : '0'}`,
    transition: 'margin-left 0.3s ease-in-out',
  };
});

function LayoutContent({ children }) {
  const isLoggedIn = getToken();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isUserLoginIn, setIsUserLoginIn] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const { open } = useSelector(state => state.toast);

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
        default:
          return 'CIOptimize';
      }
    };
    document.title = getTitleByPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!isClient) return;
    if (isLoggedIn && isPublicRoute) {
      router.replace('/dashboard');
    } else if (
      !isLoggedIn &&
      !isPublicRoute &&
      !pathname.startsWith('/login')
    ) {
      const fullUrl = `${pathname}?${searchParams.toString()}`;
      const encodedUrl = encodeURIComponent(fullUrl);
      router.replace(`/login?redirect=${encodedUrl}`);
    }
  }, [isLoggedIn, isPublicRoute, router, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (isLoggedIn) {
      setIsUserLoginIn(isLoggedIn);
      dispatch(getUserData());
    }
  }, [dispatch, isLoggedIn, isClient]);

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

export default function CommonLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeRegistry>
              <LayoutContent>{children}</LayoutContent>
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
