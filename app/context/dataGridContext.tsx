'use client';

import React, { createContext, useContext, useRef } from 'react';
import { GridApi } from '@mui/x-data-grid-premium';

// Define the context type
type DataGridContextType = {
  apiRef: React.MutableRefObject<GridApi | null>;
  setApiRef: (ref: GridApi) => void;
};

// Create the context with a default value
const DataGridContext = createContext<DataGridContextType | undefined>(
  undefined
);

// Provider component
export function DataGridProvider({ children }: { children: React.ReactNode }) {
  // Create a ref that will hold the apiRef
  const apiRef = useRef<GridApi | null>(null);

  // Function to set the apiRef
  const setApiRef = (ref: GridApi) => {
    apiRef.current = ref;
  };

  return (
    <DataGridContext.Provider value={{ apiRef, setApiRef }}>
      {children}
    </DataGridContext.Provider>
  );
}

// Custom hook for consuming the context
export function useDataGrid() {
  const context = useContext(DataGridContext);

  if (context === undefined) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }

  return context;
}
