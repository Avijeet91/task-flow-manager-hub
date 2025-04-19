
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
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

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
        
        setSettings({
          darkMode: Boolean(data.dark_mode),
          compactMode: Boolean(data.compact_mode),
          fontSize: validFontSize,
          notifications
        });
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
        await saveSettings(defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return;

    try {
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
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  return {
    settings,
    loading,
    saveSettings
  };
};
