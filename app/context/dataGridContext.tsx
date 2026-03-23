'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { GridApi } from '@mui/x-data-grid-premium';

type DataGridContextType = {
  apiRefs: React.MutableRefObject<Record<string, GridApi | null>>;
  setApiRef: (id: string, ref: GridApi) => void;
  getApiRef: (id?: string) => GridApi | null;
  gridId: string;
  setGridId: (id: string) => void;
  setMasterRows: (id: string, rows: any[]) => void;
  getMasterRows: (id: string) => any[];
  updateMasterRows: (id: string, updatedRows: any[]) => void;
  setAllocationMaster: (rows: any[]) => void;
  getAllocationMaster: () => any[];
  updateAllocationMaster: (updatedRows: any[]) => void;
};

const DataGridContext = createContext<DataGridContextType | undefined>(
  undefined
);

export function DataGridProvider({ children }: { children: React.ReactNode }) {
  const apiRefs = useRef<Record<string, GridApi | null>>({});
  const masterRowsRef = useRef<Record<string, any[]>>({});
  const allocationMasterRef = useRef<any[]>([]);
  const [gridId, setGridId] = useState('main');

  const setApiRef = (id: string, ref: GridApi) => {
    apiRefs.current[id] = ref;
  };

  const getApiRef = (id?: string) => {
    return apiRefs.current[id ?? gridId] || null;
  };

  const setMasterRows = (id: string, rows: any[]) => {
    masterRowsRef.current[id] = rows;
  };

  const getMasterRows = (id: string): any[] => {
    return masterRowsRef.current[id] ?? [];
  };

  const updateMasterRows = (id: string, updatedRows: any[]) => {
    const existing = masterRowsRef.current[id] ?? [];
    const deleteIds = new Set(
      updatedRows.filter(r => r._action === 'delete').map(r => r.id)
    );
    const upsertRows = updatedRows.filter(r => r._action !== 'delete');
    const upsertMap = new Map(upsertRows.map(r => [r.id, r]));

    // Remove deleted rows, update existing rows
    const merged = existing
      .filter(r => !deleteIds.has(r.id))
      .map(r => (upsertMap.has(r.id) ? { ...r, ...upsertMap.get(r.id) } : r));

    // Add brand-new rows (not previously in master)
    const existingIds = new Set(existing.map(r => r.id));
    for (const row of upsertRows) {
      if (!existingIds.has(row.id)) {
        merged.push(row);
      }
    }

    masterRowsRef.current[id] = merged;
  };

  const setAllocationMaster = (rows: any[]) => {
    allocationMasterRef.current = rows;
  };

  const getAllocationMaster = (): any[] => {
    return allocationMasterRef.current ?? [];
  };

  const updateAllocationMaster = (updatedRows: any[]) => {
    const existing = allocationMasterRef.current ?? [];
    const deleteIds = new Set(
      updatedRows.filter(r => r._action === 'delete').map(r => r.id)
    );
    const upsertRows = updatedRows.filter(r => r._action !== 'delete');
    const upsertMap = new Map(upsertRows.map(r => [r.id, r]));

    // Remove deleted rows, update existing rows
    const merged = existing
      .filter(r => !deleteIds.has(r.id))
      .map(r => (upsertMap.has(r.id) ? { ...r, ...upsertMap.get(r.id) } : r));

    // Add brand-new rows (not previously in master)
    const existingIds = new Set(existing.map(r => r.id));
    for (const row of upsertRows) {
      if (!existingIds.has(row.id)) {
        merged.push(row);
      }
    }

    allocationMasterRef.current = merged;
  };

  return (
    <DataGridContext.Provider
      value={{ apiRefs, setApiRef, getApiRef, gridId, setGridId, setMasterRows, getMasterRows, updateMasterRows, setAllocationMaster, getAllocationMaster, updateAllocationMaster }}
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
