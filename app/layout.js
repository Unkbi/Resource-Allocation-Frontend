import "./styles/globals.css";
import StoreProvide from "./StoreProvider";
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter';

export const metadata = {
  title: "resorce allocations",
  description: "Resorce Allocations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvide>
          <AppRouterCacheProvider> 
        {children}
      </AppRouterCacheProvider>
        </StoreProvide>
      </body>
    </html>
  );
}
