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
// import { LicenseInfo } from '@mui/x-data-grid-premium';

const MainContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'isLoggedIn', 
})(({ theme, isLoggedIn }) => {
  return {
    background: '#fff',
    marginLeft: `${isLoggedIn ? '74px' : '0'}`,
    paddingTop: `${isLoggedIn ? '52px' : '0'}`,
  };
});

function LayoutContent({ children }) {
  const isLoggedIn = getToken();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const [isUserLoginIn,setIsUserLoginIn]=useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  // const licenseKey = process.env.MUI_X_LICENSE_KEY;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    setIsClient(true); 
  }, []);

  useEffect(() => {
    if (!isClient) return; 
    if (isLoggedIn && isPublicRoute) {
      router.replace('/allocation');
    } else if (!isLoggedIn && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isLoggedIn, isPublicRoute, router,isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (isLoggedIn) {
      setIsUserLoginIn(isLoggedIn)
      dispatch(getUserData());
    }
  }, [dispatch,isLoggedIn,isClient]);

  // if (licenseKey) {
  //   LicenseInfo.setLicenseKey(licenseKey);
  // } else {
  //   console.error('MUI X License Key is missing. Please set it in .env.local.');
  // }

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
