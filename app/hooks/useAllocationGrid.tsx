'use client';

import { useDataGrid } from '@/app/context/dataGridContext';
import { useEffect, useState } from 'react';
import { AllocationGridCell } from '../types';

export function useAllocationGrid(gridId: string = 'main') {
  const { getApiRef } = useDataGrid();
  const apiRef = getApiRef(gridId);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reset ready when apiRef changes
    setReady(false);

    if (!apiRef || typeof apiRef.subscribeEvent !== 'function') return;

    const unsubscribe = apiRef.subscribeEvent('rowsSet', () => {
      setReady(true);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [apiRef]);

  const getAllRows = () => {
    if (!apiRef) return [];
    try {
      return Array.from(apiRef.getRowModels().values());
    } catch (error) {
      console.error('Error getting rows:', error);
      return [];
    }
  };

  const getRow = (id: string) => {
    if (!apiRef) return null;
    try {
      return apiRef.getRow(id);
    } catch (error) {
      console.error(`Error getting row ${id}:`, error);
      return null;
    }
  };

  const updateRows = (rowUpdates: AllocationGridCell[]) => {
    if (!apiRef) return;
    try {
      apiRef.updateRows(rowUpdates);
    } catch (error) {
      console.error('Error updating rows:', error);
    }
  };

  const setRows = (rows: AllocationGridCell[]) => {
    if (!apiRef) return;
    try {
      apiRef.setRows(rows);
    } catch (error) {
      console.error('Error setting rows:', error);
    }
  };

  const getSelectedRows = () => {
    if (!apiRef) return [];
    try {
      return Array.from(apiRef.getSelectedRows().keys());
    } catch (error) {
      console.error('Error getting selected rows:', error);
      return [];
    }
  };

  return {
    apiRef,
    getAllRows,
    getRow,
    updateRows,
    setRows,
    getSelectedRows,
    ready,
  };
}
