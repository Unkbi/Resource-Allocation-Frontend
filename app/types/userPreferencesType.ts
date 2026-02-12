import { ScalarSettings } from './allSettingsType';

export type HOURS = 'Hours';
export type PERCENTAGES = 'Percentages';
export type FRACTIONS = 'Fractions';

export type actualsDisplayType = HOURS | PERCENTAGES | FRACTIONS;

export interface UserPreferences {
  userPreferences: ScalarSettings | null;
  actualsDisplayType: actualsDisplayType;
  loading: false;
  error: null;
}

export interface UserPreferencesArrayElement {
  Key: string;
  Value: string | number | boolean;
  __path__: string | null;
  __parent__: string | null;
}
