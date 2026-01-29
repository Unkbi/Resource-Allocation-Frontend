import { TOTAL_HOURS_IN_WEEK } from '../constants/constants';
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
  }));
};
