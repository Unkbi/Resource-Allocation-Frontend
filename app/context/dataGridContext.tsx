'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { GridApi } from '@mui/x-data-grid-premium';

type DataGridContextType = {
  apiRefs: React.MutableRefObject<Record<string, GridApi | null>>;
  setApiRef: (id: string, ref: GridApi) => void;
  getApiRef: (id?: string) => GridApi | null;
  gridId: string;
  setGridId: (id: string) => void;
};

const DataGridContext = createContext<DataGridContextType | undefined>(
  undefined
);

export function DataGridProvider({ children }: { children: React.ReactNode }) {
  const apiRefs = useRef<Record<string, GridApi | null>>({});
  const [gridId, setGridId] = useState('main');

  const setApiRef = (id: string, ref: GridApi) => {
    apiRefs.current[id] = ref;
  };

  const getApiRef = (id?: string) => {
    return apiRefs.current[id ?? gridId] || null;
  };

  return (
    <DataGridContext.Provider
      value={{ apiRefs, setApiRef, getApiRef, gridId, setGridId }}
    >
      {children}
    </DataGridContext.Provider>
  );
}

export function useDataGrid() {
  const context = useContext(DataGridContext);

  if (context === undefined) {
    throw new Error('useDataGrid must be used within a DataGridProvider');
  }

  return context;
}
