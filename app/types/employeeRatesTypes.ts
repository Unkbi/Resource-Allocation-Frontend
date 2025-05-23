export interface EmployeeRates {
  HRLevel: string | null;
  HourlyRate: number | null;
  ValidityEndDate: string | null;
  __Id__: string;
  HourlyRateCurrency: string | null;
  WorkLocation: string | null;
  ValidityStartDate: string | null;
  __path__: string | null;
  __parent__: string | null;
}

export interface EmployeeRatesState {
  employeeRates: EmployeeRates[] | null;
  loading: boolean;
  error: string | null;
}
