"use client";
import "./styles/globals.css";
import StoreProvider from "./StoreProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from "./theme/ThemeRegistry";
import SideBar from "./components/Shared/Sidebar/Sidebar";
import Header from "./components/Shared/Header/Header";
import { useAuth } from "./hooks/useAuth";
import { Box, styled } from "@mui/material";
const MainContent = styled(Box)(({ theme,user }) => ({
  background: "#fff",
  marginLeft: user ? "74px" : 0,
  paddingTop: user ? "52px" : 0
}));

// export const metadata = {
//   title: "Resource Allocations", 
//   description: "Resource Allocations",
// };

export default function CommonLayout({ children }) {
  const isLoggedIn = useAuth();
  
  if (!isLoggedIn) {
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
