// app/layout.js
import './styles/globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import StoreProvider from './StoreProvider';
import ThemeRegistry from './theme/ThemeRegistry';
import { DataGridProvider } from './context/dataGridContext';
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
                <DataGridProvider>
                  <LayoutClient>{children}</LayoutClient>
                </DataGridProvider>
              </Suspense>
            </ThemeRegistry>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
