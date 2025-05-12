'use client';

import { useDataGrid } from '@/app/context/dataGridContext';
import { AllocationGridCell } from '../types';

export function useAllocationGrid() {
  const { apiRef } = useDataGrid();

  // Get all rows
  const getAllRows = () => {
    if (!apiRef.current) return [];

    try {
      const rows = apiRef.current.getRowModels();
      return Array.from(rows.values());
    } catch (error) {
      console.error('Error getting rows:', error);
      return [];
    }
  };

  // Get a specific row
  const getRow = (id: string) => {
    if (!apiRef.current) return null;

    try {
      return apiRef.current.getRow(id);
    } catch (error) {
      console.error(`Error getting row ${id}:`, error);
      return null;
    }
  };

  // Update rows
  const updateRows = (rowUpdates: AllocationGridCell[]) => {
    if (!apiRef.current) return;

    try {
      apiRef.current.updateRows(rowUpdates);
    } catch (error) {
      console.error('Error updating rows:', error);
    }
  };

  // Set all rows
  const setRows = (rows: AllocationGridCell[]) => {
    if (!apiRef.current) return;

    try {
      apiRef.current.setRows(rows);
    } catch (error) {
      console.error('Error setting rows:', error);
    }
  };

  // Get selected rows
  const getSelectedRows = () => {
    if (!apiRef.current) return [];

    try {
      return Array.from(apiRef.current.getSelectedRows().keys());
    } catch (error) {
      console.error('Error getting selected rows:', error);
      return [];
    }
  };

  return {
    apiRef: apiRef.current,
    getAllRows,
    getRow,
    updateRows,
    setRows,
    getSelectedRows,
  };
}
