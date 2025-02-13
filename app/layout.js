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
import { useDispatch } from 'react-redux';

const MainContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'isLoggedIn', // Prevent `isLoggedIn` from being passed to the DOM
})(({ theme, isLoggedIn }) => ({
  background: '#fff',
  marginLeft: `${isLoggedIn ? '74px' : '0'}`,
  paddingTop: `${isLoggedIn ? '52px' : '0'}`,
}));

function LayoutContent({ children }) {
  const isLoggedIn = getToken();
  const [isUserLoginIn,setIsUserLoginIn]=useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  useEffect(() => {
    if (isLoggedIn && isPublicRoute) {
      router.push('/dashboard');
    } else if (!isLoggedIn && !isPublicRoute) {
      router.push('/login');
    }
  }, [isLoggedIn, isPublicRoute, router]);

  useEffect(() => {
    if (isLoggedIn) {
      setIsUserLoginIn(isLoggedIn)
      dispatch(getUserData());
    }
  }, [dispatch, isLoggedIn]);

  return (
    <>
      {!isPublicRoute && <Header />}
      {!isPublicRoute && <SideBar />}
      <MainContent isLoggedIn={isUserLoginIn}>{children}</MainContent>
    </>
  );
}

export default function CommonLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          {/* ✅ Ensures Redux Provider is applied before using hooks */}
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
