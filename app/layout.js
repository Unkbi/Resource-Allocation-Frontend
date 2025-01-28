import "./styles/globals.css";
import StoreProvider from "./StoreProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from "./theme/ThemeRegistry";
import SideBar from "./components/Shared/Sidebar/Sidebar";
import Header from "./components/Shared/Header/Header";

export const metadata = {
  title: "Resource Allocations", 
  description: "Resource Allocations",
};

export default function CommonLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeRegistry>
            <Header />
            <SideBar/>
              {children} 
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
