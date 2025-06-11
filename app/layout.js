// app/layout.js
import './styles/globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import StoreProvider from './StoreProvider';
import ThemeRegistry from './theme/ThemeRegistry';
import { Suspense } from 'react';
import LayoutClient from './layoutClient';

// Test Comment to be deleted.
export default function CommonLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeRegistry>
              <Suspense fallback={null}>
                <LayoutClient>{children}</LayoutClient>
              </Suspense>
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
