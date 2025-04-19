
/**
 * Utility functions for managing user settings in localStorage
 */

// The prefix for all settings keys in localStorage
const SETTINGS_PREFIX = 'task_manager_settings_';

// Type definition for user settings
export interface UserSettings {
  darkMode?: boolean;
  compactMode?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  notifications?: {
    taskAssigned?: boolean;
    taskUpdated?: boolean;
    taskCompleted?: boolean;
    commentAdded?: boolean;
  };
  [key: string]: any; // Allow for additional settings
}

/**
 * Save user settings to localStorage
 * @param userId - The user's ID
 * @param settings - The settings object to save
 */
export const saveUserSettings = (userId: string, settings: UserSettings): void => {
  try {
    localStorage.setItem(`${SETTINGS_PREFIX}${userId}`, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save user settings:', error);
  }
};

/**
 * Load user settings from localStorage
 * @param userId - The user's ID
 * @returns The user's settings object or default settings if none exist
 */
export const loadUserSettings = (userId: string): UserSettings => {
  try {
    const savedSettings = localStorage.getItem(`${SETTINGS_PREFIX}${userId}`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Failed to load user settings:', error);
  }
  
  // Return default settings if nothing is saved or if there was an error
  return {
    darkMode: false,
    compactMode: false,
    fontSize: 'medium',
    notifications: {
      taskAssigned: true,
      taskUpdated: true,
      taskCompleted: true,
      commentAdded: true,
    }
  };
};

/**
 * Update a specific setting for a user
 * @param userId - The user's ID
 * @param key - The setting key to update
 * @param value - The new value for the setting
 */
export const updateUserSetting = (userId: string, key: string, value: any): void => {
  const currentSettings = loadUserSettings(userId);
  const updatedSettings = {
    ...currentSettings,
    [key]: value,
  };
  saveUserSettings(userId, updatedSettings);
};

/**
 * Clear all settings for a user
 * @param userId - The user's ID
 */
export const clearUserSettings = (userId: string): void => {
  localStorage.removeItem(`${SETTINGS_PREFIX}${userId}`);
};
