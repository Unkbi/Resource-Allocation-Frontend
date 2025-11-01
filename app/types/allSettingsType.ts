import { ProjectType, ProjectTypeGroup } from './projectTypesType';
import { Location, LocationGroup } from './locationTypes';
import { AllocationRange } from './settingTypes';
import { User } from './userTypes';

export interface ScalarSettings {
  [key: string]: string | number | boolean;
}

export interface ScalarSettingsArrayElement {
  SettingKey: string;
  SettingValue: string | number | boolean;
  __path__: string | null;
  __parent__: string | null;
}

export interface AllSettings {
  allocationTheme: AllocationRange[];
  projectTypes: ProjectType[];
  projectTypeGroups: ProjectTypeGroup[];
  location: Location[];
  locationGroups: LocationGroup[];
  users: User[];
  scalarSettings: ScalarSettings | null;
  loading: boolean;
  error: string | null;
}

export interface ScalarSettingsPayload {
  SettingKey: string;
  SettingValue: string | number | boolean;
}
