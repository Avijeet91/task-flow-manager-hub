
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

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

      // Validate that user.id is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      
      if (!isValidUUID) {
        console.warn(`Invalid UUID format for user.id: ${user.id}. Using local settings instead.`);
        // Use localStorage fallback
        const localSettings = loadLocalSettings();
        setSettings(localSettings);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Handle type conversion properly
        const fontSize = data.font_size as string;
        const validFontSize: 'small' | 'medium' | 'large' = 
          fontSize === 'small' || fontSize === 'large' ? fontSize : 'medium';
          
        // Parse the notifications to ensure correct typing
        const notificationsData = data.notifications as Json;
        
        // Create a properly typed notifications object with safe defaults
        let notifications = {
          taskAssigned: true,
          taskUpdated: true,
          taskCompleted: true,
          commentAdded: true
        };
        
        // Only try to extract values if notificationsData is a non-null object
        if (notificationsData && typeof notificationsData === 'object' && !Array.isArray(notificationsData)) {
          // Now TypeScript knows this is an object with string keys
          const notifObj = notificationsData as Record<string, unknown>;
          notifications = {
            taskAssigned: typeof notifObj.taskAssigned === 'boolean' ? notifObj.taskAssigned : true,
            taskUpdated: typeof notifObj.taskUpdated === 'boolean' ? notifObj.taskUpdated : true,
            taskCompleted: typeof notifObj.taskCompleted === 'boolean' ? notifObj.taskCompleted : true,
            commentAdded: typeof notifObj.commentAdded === 'boolean' ? notifObj.commentAdded : true
          };
        }
        
        const userSettings = {
          darkMode: Boolean(data.dark_mode),
          compactMode: Boolean(data.compact_mode),
          fontSize: validFontSize,
          notifications
        };
        
        setSettings(userSettings);
        saveLocalSettings(userSettings);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          darkMode: false,
          compactMode: false,
          fontSize: 'medium' as const,
          notifications: {
            taskAssigned: true,
            taskUpdated: true,
            taskCompleted: true,
            commentAdded: true
          }
        };
        
        // Try to save to database if we have a valid user ID
        if (isValidUUID) {
          await saveSettings(defaultSettings);
        }
        
        setSettings(defaultSettings);
        saveLocalSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
      
      // Fallback to local settings
      const localSettings = loadLocalSettings();
      setSettings(localSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;

    try {
      // Check if UUID is valid before attempting to save to database
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      
      if (!isValidUUID) {
        console.warn(`Invalid UUID format for user.id: ${user.id}. Saving to localStorage only.`);
        saveLocalSettings(newSettings);
        setSettings(newSettings);
        toast.success('Settings saved locally');
        return;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          dark_mode: newSettings.darkMode,
          compact_mode: newSettings.compactMode,
          font_size: newSettings.fontSize,
          notifications: newSettings.notifications
        });

      if (error) throw error;

      setSettings(newSettings);
      saveLocalSettings(newSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings to database, but saved locally');
      
      // Always save locally as fallback
      saveLocalSettings(newSettings);
      setSettings(newSettings);
    }
  };

  // Local storage functions for fallback
  const loadLocalSettings = (): UserSettings => {
    try {
      const storedSettings = localStorage.getItem('user_settings');
      if (storedSettings) {
        return JSON.parse(storedSettings);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    
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

  const saveLocalSettings = (settings: UserSettings): void => {
    try {
      localStorage.setItem('user_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  };

  return {
    settings,
    loading,
    saveSettings
  };
};
