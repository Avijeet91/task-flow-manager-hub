
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface UserSettings {
  darkMode: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    taskAssigned: boolean;
    taskUpdated: boolean;
    taskCompleted: boolean;
    commentAdded: boolean;
  };
}

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      // If no user, set default settings to avoid UI issues
      setSettings({
        darkMode: false,
        compactMode: false,
        fontSize: 'medium',
        notifications: {
          taskAssigned: true,
          taskUpdated: true,
          taskCompleted: true,
          commentAdded: true
        }
      });
      setLoading(false);
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID is undefined");
      }

      // Use localStorage for settings
      const localSettings = loadLocalSettings(user.id);
      setSettings(localSettings);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
      
      // Use default settings as fallback
      const defaultSettings = getDefaultSettings();
      setSettings(defaultSettings);
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;

    try {
      // Save settings to localStorage
      saveLocalSettings(user.id, newSettings);
      setSettings(newSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  // Local storage functions
  const getDefaultSettings = (): UserSettings => {
    return {
      darkMode: false,
      compactMode: false,
      fontSize: 'medium',
      notifications: {
        taskAssigned: true,
        taskUpdated: true,
        taskCompleted: true,
        commentAdded: true
      }
    };
  };

  const loadLocalSettings = (userId: string): UserSettings => {
    try {
      const settingsKey = `user_settings_${userId}`;
      const storedSettings = localStorage.getItem(settingsKey);
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    
    return getDefaultSettings();
  };

  const saveLocalSettings = (userId: string, settings: UserSettings): void => {
    try {
      const settingsKey = `user_settings_${userId}`;
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      throw error;
    }
  };

  return {
    settings,
    loading,
    saveSettings
  };
};
