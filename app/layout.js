"use client";
import "./styles/globals.css";
import StoreProvider from "./StoreProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from "./theme/ThemeRegistry";
import SideBar from "./components/Shared/Sidebar/Sidebar";
import Header from "./components/Shared/Header/Header";
import { usePathname, useRouter } from "next/navigation";

import { Box, styled } from "@mui/material";
import { getToken } from "./utils/authUtils";
import { PUBLIC_ROUTES } from "./constants/constants";
const MainContent = styled(Box)(() => ({
  background: "#fff",
  marginLeft:"74px",
  paddingTop:"52px"
}));

export default function CommonLayout({ children }) {
  const isLoggedIn = getToken();
  const pathname = usePathname(); 
  const router = useRouter(); 
  const isPublicRoute =PUBLIC_ROUTES.includes(pathname);
  if (isLoggedIn && isPublicRoute) {
    router.push("/dashboard"); 
    return null;
  }
  
  if (!isLoggedIn && !isPublicRoute) {
    router.push("/login");
    return null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeRegistry>
            {!isPublicRoute && <Header />}
            {!isPublicRoute && <SideBar/>}
            <MainContent>
              {children} 
            </MainContent>
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}


