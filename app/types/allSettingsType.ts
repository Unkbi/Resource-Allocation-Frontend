import { ProjectType } from './projectTypesType';
import { AllocationRange } from './settingTypes';

export interface AllSettings {
  allocationTheme: AllocationRange[];
  projectTypes: ProjectType[];
  loading: boolean;
  error: string | null;
}
