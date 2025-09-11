/**
 * Utility functions for settings management
 */

export interface SettingPayload {
  SettingKey: string;
  SettingValue: string;
}

export interface SettingsData {
  [key: string]: string | number;
}

/**
 * Transform settings object into array of SettingKey/SettingValue pairs
 */
export const transformToSettingPayloads = (settings: SettingsData): SettingPayload[] => {
  return Object.entries(settings).map(([key, value]) => ({
    SettingKey: key,
    SettingValue: formatSettingValue(key, value),
  }));
};

/**
 * Format setting values based on their type/key
 */
const formatSettingValue = (key: string, value: string | number): string => {
  // For numeric allocation settings, ensure one decimal place
  if (key === 'Max_Allocation_Warning' || key === 'Max_Allocation_Error') {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const formatted = isNaN(numValue) ? '0.0' : numValue.toFixed(1);
    console.log(`Formatting ${key}: ${value} -> ${formatted}`);
    return formatted;
  }
  
  // For other settings, convert to string as-is
  return String(value);
};

/**
 * Check if settings exist in current scalar settings
 */
export const checkSettingsExist = (
  settingsToCheck: SettingsData,
  existingSettings: Record<string, any> = {}
): boolean => {
  const keysToCheck = Object.keys(settingsToCheck);
  return keysToCheck.every(key => existingSettings.hasOwnProperty(key));
};

/**
 * Get only changed settings by comparing current values with original values
 */
export const getChangedSettings = (
  currentSettings: SettingsData,
  originalSettings: Record<string, any> = {}
): SettingsData => {
  const changedSettings: SettingsData = {};
  
  Object.entries(currentSettings).forEach(([key, value]) => {
    const currentValue = formatSettingValue(key, value);
    const originalValue = formatSettingValue(key, originalSettings[key] || '');
    
    // Include if value has changed or if it's a new field
    if (currentValue !== originalValue) {
      changedSettings[key] = value;
    }
  });
  
  return changedSettings;
};

/**
 * Check if a setting value is considered "empty" or "new"
 */
const isEmptyOrNewSetting = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  const stringValue = String(value).trim();
  
  // Check for numeric zero values (including formatted decimals)
  const numericValue = parseFloat(stringValue);
  if (!isNaN(numericValue) && numericValue === 0.0) return true;
  
  // Consider empty strings, zero values, and common placeholder text as "new"
  return stringValue === '' || 
         stringValue === '0' || 
         stringValue === '0.0' ||
         stringValue === 'Allocation for x (resource name) has exceeded the warning threshold.' ||
         stringValue === 'Allocation for x (resource name) has exceeded the allowed threshold.';
};

/**
 * Split settings into existing and new based on current scalar settings
 * A setting is considered "new" if:
 * 1. The key doesn't exist in existingSettings, OR
 * 2. The key exists but has an empty/default value (null, undefined, '', '0', '0.0')
 */
export const categorizeSettings = (
  settingsToSave: SettingsData,
  existingSettings: Record<string, any> = {}
): { existing: SettingPayload[]; new: SettingPayload[] } => {
  const existing: SettingPayload[] = [];
  const newSettings: SettingPayload[] = [];

  Object.entries(settingsToSave).forEach(([key, value]) => {
    const payload = { SettingKey: key, SettingValue: formatSettingValue(key, value) };
    
    // Check if setting exists AND has a meaningful value
    const hasKey = existingSettings.hasOwnProperty(key);
    const hasValue = hasKey && !isEmptyOrNewSetting(existingSettings[key]);
    
    if (hasValue) {
      existing.push(payload);
    } else {
      newSettings.push(payload);
    }
  });

  return { existing, new: newSettings };
};

/**
 * Batch API calls for multiple settings
 */
export const batchSettingsUpdate = async (
  dispatch: any,
  settings: SettingPayload[],
  actionType: string,
  batchSize: number = 5
): Promise<void> => {
  const batches = [];
  for (let i = 0; i < settings.length; i += batchSize) {
    batches.push(settings.slice(i, i + batchSize));
  }

  const promises = batches.map(batch =>
    Promise.all(
      batch.map(setting =>
        dispatch({
          type: actionType,
          payload: { postData: setting }
        })
      )
    )
  );

  await Promise.all(promises);
};

/**
 * Alternative: Single API call with array of settings (if your API supports this)
 */
export const saveBulkSettings = async (
  dispatch: any,
  settings: SettingPayload[],
  actionType: string
): Promise<void> => {
  return dispatch({
    type: actionType,
    payload: { postData: settings }
  });
};

/**
 * Optimized settings handler that only sends changed fields
 */
export const handleOptimizedSettingsSave = async (
  dispatch: any,
  currentSettings: SettingsData,
  databaseSettings: Record<string, any> = {}, // Current settings from database/API
  options: {
    updateAction: string;
    addAction: string;
    supportsBulk?: boolean;
    batchSize?: number;
    originalSettings?: Record<string, any>; // Original UI values for change detection
  }
): Promise<{ changedCount: number; skippedCount: number }> => {
  const { updateAction, addAction, supportsBulk = false, batchSize = 3, originalSettings = {} } = options;
  
  try {
    // Get only the changed settings (compare with original UI values if provided, otherwise use database values)
    const changedSettings = getChangedSettings(currentSettings, originalSettings || databaseSettings);
    const totalFields = Object.keys(currentSettings).length;
    const changedFields = Object.keys(changedSettings).length;
    const skippedCount = totalFields - changedFields;
    
    if (changedFields === 0) {
      return { changedCount: 0, skippedCount: totalFields };
    }
    
    if (supportsBulk) {
      // If API supports bulk operations, send all changed settings at once
      const allPayloads = transformToSettingPayloads(changedSettings);
      await saveBulkSettings(dispatch, allPayloads, updateAction);
    } else {
      // Categorize based on database settings (not original UI values)
      const { existing, new: newSettings } = categorizeSettings(changedSettings, databaseSettings);
      const promises = [];
      
      if (existing.length > 0) {
        promises.push(batchSettingsUpdate(dispatch, existing, updateAction, batchSize));
      }
      
      if (newSettings.length > 0) {
        promises.push(batchSettingsUpdate(dispatch, newSettings, addAction, batchSize));
      }
      
      await Promise.all(promises);
    }
    
    return { changedCount: changedFields, skippedCount };
  } catch (error) {
    console.error('Error in handleOptimizedSettingsSave:', error);
    throw error;
  }
};
