export interface SettingPayload {
  SettingKey: string;
  SettingValue: string;
}
export interface SettingsData {
  [key: string]: string | number;
}

export const transformToSettingPayloads = (
  settings: SettingsData
): SettingPayload[] => {
  return Object.entries(settings).map(([key, value]) => ({
    SettingKey: key,
    SettingValue: formatSettingValue(key, value),
  }));
};

const formatSettingValue = (key: string, value: string | number): string => {
  if (key === 'Max_Allocation_Warning' || key === 'Max_Allocation_Error') {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const formatted = isNaN(numValue) ? '0.0' : numValue.toFixed(2);
    return formatted;
  }
  return String(value);
};

export const checkSettingsExist = (
  settingsToCheck: SettingsData,
  existingSettings: Record<string, any> = {}
): boolean => {
  const keysToCheck = Object.keys(settingsToCheck);
  return keysToCheck.every(key => existingSettings.hasOwnProperty(key));
};

export const getChangedSettings = (
  currentSettings: SettingsData,
  originalSettings: Record<string, any> = {}
): SettingsData => {
  const changedSettings: SettingsData = {};

  Object.entries(currentSettings).forEach(([key, value]) => {
    const currentValue = formatSettingValue(key, value);
    const originalValue = formatSettingValue(key, originalSettings[key] || '');

    if (currentValue !== originalValue) {
      changedSettings[key] = value;
    }
  });

  return changedSettings;
};

const isEmptyOrNewSetting = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  const stringValue = String(value).trim();

  const numericValue = parseFloat(stringValue);
  if (!isNaN(numericValue) && numericValue === 0.0) return true;

  return (
    stringValue === '' ||
    stringValue === '0' ||
    stringValue === '0.0' ||
    stringValue ===
      'Allocation for x (resource name) has exceeded the warning threshold.' ||
    stringValue ===
      'Allocation for x (resource name) has exceeded the allowed threshold.'
  );
};

export const categorizeSettings = (
  settingsToSave: SettingsData,
  existingSettings: Record<string, any> = {}
): { existing: SettingPayload[]; new: SettingPayload[] } => {
  const existing: SettingPayload[] = [];
  const newSettings: SettingPayload[] = [];

  Object.entries(settingsToSave).forEach(([key, value]) => {
    const payload = {
      SettingKey: key,
      SettingValue: formatSettingValue(key, value),
    };
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
          payload: { postData: setting },
        })
      )
    )
  );

  await Promise.all(promises);
};

export const saveBulkSettings = async (
  dispatch: any,
  settings: SettingPayload[],
  actionType: string
): Promise<void> => {
  return dispatch({
    type: actionType,
    payload: { postData: settings },
  });
};

export const handleOptimizedSettingsSave = async (
  dispatch: any,
  currentSettings: SettingsData,
  databaseSettings: Record<string, any> = {},
  options: {
    updateAction: string;
    addAction: string;
    supportsBulk?: boolean;
    batchSize?: number;
    originalSettings?: Record<string, any>;
  }
): Promise<{ changedCount: number; skippedCount: number }> => {
  const {
    updateAction,
    addAction,
    supportsBulk = false,
    batchSize = 3,
    originalSettings = {},
  } = options;

  try {
    debugger;

    const changedSettings = getChangedSettings(
      currentSettings,
      originalSettings || databaseSettings
    );
    const totalFields = Object.keys(currentSettings).length;
    const changedFields = Object.keys(changedSettings).length;
    const skippedCount = totalFields - changedFields;

    if (changedFields === 0) {
      return { changedCount: 0, skippedCount: totalFields };
    }

    if (supportsBulk) {
      const allPayloads = transformToSettingPayloads(changedSettings);
      await saveBulkSettings(dispatch, allPayloads, updateAction);
    } else {
      const { existing, new: newSettings } = categorizeSettings(
        changedSettings,
        databaseSettings
      );
      const promises = [];

      if (existing.length > 0) {
        promises.push(
          batchSettingsUpdate(dispatch, existing, updateAction, batchSize)
        );
      }

      if (newSettings.length > 0) {
        promises.push(
          batchSettingsUpdate(dispatch, newSettings, addAction, batchSize)
        );
      }

      await Promise.all(promises);
    }

    return { changedCount: changedFields, skippedCount };
  } catch (error) {
    console.error('Error in handleOptimizedSettingsSave:', error);
    throw error;
  }
};
