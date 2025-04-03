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

/* This is a General Type for API Response */
export interface ApiResponse<T> {
  status?: string;
  result: T | null; // The actual data returned by the API
  type?: string;
}
