import { getMondayOfISO } from './common';

export const isPeriodPastWeek = (period: string) =>
  getMondayOfISO(new Date().toISOString()) > getMondayOfISO(period);

export const isPeriodCurrentWeek = (period: string) =>
  getMondayOfISO(new Date().toISOString()) === getMondayOfISO(period);

export const isPeriodFutureWeek = (period: string) =>
  getMondayOfISO(new Date().toISOString()) < getMondayOfISO(period);
