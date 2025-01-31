"use client";
import "./styles/globals.css";
import StoreProvider from "./StoreProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from "./theme/ThemeRegistry";
import SideBar from "./components/Shared/Sidebar/Sidebar";
import Header from "./components/Shared/Header/Header";
import { usePathname } from "next/navigation";
// import { useAuth } from "./hooks/useAuth"; uncomment this after implementing login

import { Box, styled } from "@mui/material";
const MainContent = styled(Box)(({ theme }) => ({
  background: "#fff",
  marginLeft:"74px",
  paddingTop:"52px"
}));

// export const metadata = {
//   title: "Resource Allocations", 
//   description: "Resource Allocations",
// };

export default function CommonLayout({ children }) {
//   const isLoggedIn = useAuth(); uncomment this after implementing login
  
//   if (!isLoggedIn) {
//     return (
//    <html lang="en">
//      <body>
//      <StoreProvider>
//        {children}
//        </StoreProvider>
//      </body>
//    </html>
//  )
//   }

// add the above return statement and remove the below return statement after login implementation
  const pathname = usePathname();
  const isPublicRoute = pathname.includes('login');
  if (isPublicRoute) {
    return (
      <html lang="en">
        <body>
          <StoreProvider>
            {children}
          </StoreProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeRegistry><Header />
            <SideBar/>
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
