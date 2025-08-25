/* Here we export all are Typescript types from the app/types directory.
 * This allows us to import them easily from a single location.
 */

// Allocation-related Types
export * from './allocationTypes';

// Auth-related Types
export * from './authTypes';

// Project-related Types
export * from './projectTypes';

// Resource-related Types
export * from './resourceTypes';

// Team-related Types
export * from './teamTypes';

// User-related Types
export * from './userTypes';

// Setting-related Types
export * from './settingTypes';

// Components related Types
export * from './component';

export * from './allocationTypesCost';

// Dashboard-related Types
export * from './dashboardTypes';

// Portfolio-related Types
export * from './portfolioTypes';

// Employee-related Types
export * from './employeeRatesTypes';

// RBAC-related Types
export * from './rbacTypes';

// All Settings Types
export * from './allSettingsType';

// Project Types Types
export * from './projectTypesType';

/* This is a General Type for API Response */
export interface ApiResponse<T> {
  status?: string;
  result: T | null; // The actual data returned by the API
  type?: string;
}
