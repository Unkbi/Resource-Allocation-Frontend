import "./styles/globals.css";
import StoreProvider from "./StoreProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from "./theme/ThemeRegistry";
import SideBar from "./components/Shared/Sidebar/Sidebar";
import Header from "./components/Shared/Header/Header";
import LoginPage from "./(auth)/login/page";

export const metadata = {
  title: "Resource Allocations", 
  description: "Resource Allocations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <AppRouterCacheProvider>
              {children} 
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
