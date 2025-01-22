import "./styles/globals.css";
import StoreProvider from "./StoreProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from "./theme/ThemeRegistry";

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
            <ThemeRegistry>
              {children} 
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
