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
import MuiXLicense from './components/MuiLicence/MuiLicenceKey';

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
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    setIsClient(true); 
  }, []);

  useEffect(() => {
   const getTitleByPath = (pathname) => {
     switch(pathname) {
       case '/allocation':
         return 'Allocation';
       case '/project':
         return 'Projects';
       case '/people':
         return 'People';
       case '/report':
         return 'Reports';
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
  }, [isLoggedIn, isPublicRoute, router,isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (isLoggedIn) {
      setIsUserLoginIn(isLoggedIn)
      dispatch(getUserData());
    }
  }, [dispatch,isLoggedIn,isClient]);

  return (
    <>
      {!isPublicRoute && <Header />}
      {!isPublicRoute && <SideBar />}
      <MainContent isLoggedIn={isUserLoginIn}>{children}</MainContent>
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
