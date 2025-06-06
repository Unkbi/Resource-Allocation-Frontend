'use client';

import { useDataGrid } from '@/app/context/dataGridContext';
import { AllocationGridCell } from '../types';

export function useAllGridRowsByView() {
  const { getApiRef } = useDataGrid();

  const getAllRowsForView = (viewId: string): AllocationGridCell[] => {
    const apiRef = getApiRef(viewId);
    if (!apiRef) return [];

    try {
      return Array.from(apiRef.getRowModels().values()) as AllocationGridCell[];
    } catch (error) {
      console.error(`Error getting rows for viewId: ${viewId}`, error);
      return [];
    }
  };

  const getRowForView = (
    viewId: string,
    rowId: string
  ): AllocationGridCell | null => {
    const apiRef = getApiRef(viewId);
    if (!apiRef) return null;

    try {
      return apiRef.getRow(rowId);
    } catch (error) {
      console.error(`Error getting row ${rowId} for viewId: ${viewId}`, error);
      return null;
    }
  };

  const setRowsForView = (viewId: string, rows: AllocationGridCell[]): void => {
    const apiRef = getApiRef(viewId);
    if (!apiRef) return;

    try {
      apiRef.setRows(rows);
    } catch (error) {
      console.error(`Error setting rows for viewId: ${viewId}`, error);
    }
  };

  const updateRowsForView = (
    viewId: string,
    rowUpdates: AllocationGridCell[]
  ): void => {
    const apiRef = getApiRef(viewId);
    if (!apiRef) return;

    try {
      apiRef.updateRows(rowUpdates);
    } catch (error) {
      console.error(`Error updating rows for viewId: ${viewId}`, error);
    }
  };

  return {
    getAllRowsForView,
    getRowForView,
    setRowsForView,
    updateRowsForView,
  };
}
