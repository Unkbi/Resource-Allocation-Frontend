import {
  FRACTIONS,
  HOURS,
  STEP,
  TOTAL_HOURS_IN_WEEK,
} from '../constants/constants';
import { ActualAllocations, ActualAllocationTableRow } from '../types';
import { getMondayOfISO } from './common';

export const isPeriodPastWeek = (period: string) =>
  getMondayOfISO(new Date().toISOString()) > getMondayOfISO(period);

export const isPeriodCurrentWeek = (period: string) =>
  getMondayOfISO(new Date().toISOString()) === getMondayOfISO(period);

export const isPeriodFutureWeek = (period: string) =>
  getMondayOfISO(new Date().toISOString()) < getMondayOfISO(period);

export const isPeriodWithinRange = (
  period: Date,
  startPeriod: Date,
  endPeriod: Date
) => {
  if (!period || !startPeriod || !endPeriod) return false;
  return period >= startPeriod && period <= endPeriod;
};

export const formatAllocationDataWithToHours = (
  actualsAllocations: ActualAllocations[]
) => {
  return actualsAllocations?.map(allocation => ({
    ...allocation,
    AllocationEntered: allocation.AllocationEntered
      ? allocation.AllocationEntered * TOTAL_HOURS_IN_WEEK
      : 0,
    ActualsEntered: allocation.ActualsEntered
      ? allocation.ActualsEntered * TOTAL_HOURS_IN_WEEK
      : 0,
  }));
};

export const formatAllocationTableDataWithToHours = (
  actualsTableData: ActualAllocationTableRow[]
) => {
  return actualsTableData?.map(row => ({
    ...row,
    planned: row.planned ? row.planned * TOTAL_HOURS_IN_WEEK : 0,
    actuals: row.actuals ? row.actuals * TOTAL_HOURS_IN_WEEK : 0,
    __unit: HOURS,
  }));
};

export const formatAllocationDataWithToFTE = (
  actualsAllocations: ActualAllocations[]
) => {
  return actualsAllocations?.map(allocation => ({
    ...allocation,
    AllocationEntered: allocation.AllocationEntered
      ? allocation.AllocationEntered / TOTAL_HOURS_IN_WEEK
      : 0,
    ActualsEntered: allocation.ActualsEntered
      ? allocation.ActualsEntered / TOTAL_HOURS_IN_WEEK
      : 0,
  }));
};

export const formatAllocationTableDataWithToFTE = (
  actualsTableData: ActualAllocationTableRow[]
) => {
  return actualsTableData?.map(row => ({
    ...row,
    planned: row.planned ? row.planned / TOTAL_HOURS_IN_WEEK : 0,
    actuals: row.actuals ? row.actuals / TOTAL_HOURS_IN_WEEK : 0,
    __unit: FRACTIONS,
  }));
};

export const roundToStep05 = (value: number) => {
  return Math.round(value / STEP) * STEP;
};

export const format2 = (value: number) => {
  return Number(value.toFixed(2));
};

export const roundToNearestEven = (value: number): number => {
  return Math.round(value / 2) * 2;
};

export const normalizeAllocationValue = (value?: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  return format2(roundToStep05(num));
};

export const formatMin1Max2 = (value: number): string => {
  const fixed = value.toFixed(2); // force 2 decimals
  return fixed.endsWith('00')
    ? value.toFixed(1) // 2.00 -> 2.0
    : fixed.endsWith('0')
      ? fixed.slice(0, -1) // 2.50 -> 2.5
      : fixed; // 2.45 -> 2.45
};
