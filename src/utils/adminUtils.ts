
import { supabase } from "@/integrations/supabase/client";

export const assignAdminRole = async (userId: string) => {
  try {
    // Check if the role already exists to prevent duplicates
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (existingRole) {
      console.log("User already has admin role");
      return true;
    }
    
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error assigning admin role:", error);
    return false;
  }
};

export const checkUserRole = async (userId: string, role: 'admin' | 'employee' = 'admin') => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .single();
    
    return !!data;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
};
