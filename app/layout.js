'use client';
import { useEffect, useState } from 'react';
import './styles/globals.css';
import StoreProvider from './StoreProvider';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from './theme/ThemeRegistry';
import SideBar from './components/Shared/Sidebar/Sidebar';
import Header from './components/Shared/Header/Header';
import { usePathname, useRouter } from 'next/navigation';
import { Box, styled } from '@mui/material';
import { getToken } from './utils/authUtils';
import { PUBLIC_ROUTES } from './constants/constants';
import { getUserData } from './redux/actions/authActions';
import { useDispatch, useSelector } from 'react-redux';
import MuiXLicense from './components/MuiLicence/MuiLicenceKey';
import { CustomSnackbar } from './components/Snackbar/CustomSnackbar';
import { DataGridProvider } from './context/dataGridContext';

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
        default:
          return 'Dashboard';
      }
    };
    document.title = getTitleByPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!isClient) return;
    if (isLoggedIn && isPublicRoute) {
      router.replace('/allocation');
    } else if (!isLoggedIn && !isPublicRoute) {
      router.replace('/login');
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
              <DataGridProvider>
                <LayoutContent>{children}</LayoutContent>
              </DataGridProvider>
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
