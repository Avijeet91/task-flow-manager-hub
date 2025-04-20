
import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "employee";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  position: string;
  department: string;
  contact: string;
  join_date: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: Record<string, any>) => Promise<boolean>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Setup auth state listener and check for existing session
  useEffect(() => {
    setIsLoading(true);

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id);
          await fetchUserRoles(newSession.user.id);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user.id);
        await fetchUserRoles(initialSession.user.id);
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user roles:", error);
        return;
      }

      if (data) {
        setUserRoles(data.map(item => item.role));
      }
    } catch (error) {
      console.error("Error in fetchUserRoles:", error);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      toast.success("Login successful");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    }
  };

  // Signup function
  const signup = async (
    email: string, 
    password: string,
    userData: Record<string, any>
  ): Promise<boolean> => {
    try {
      // Generate a unique employee ID
      const employeeId = userData.employeeId || `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.name.split(' ')[0] || '',
            last_name: userData.name.split(' ').slice(1).join(' ') || '',
            employee_id: employeeId,
            position: userData.position || 'employee',
            department: userData.department || '',
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      // After signup, we need to assign the employee role
      const { data: userData2 } = await supabase.auth.getUser();
      if (userData2?.user) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userData2.user.id,
            role: 'employee'
          });

        if (roleError) {
          console.error("Error assigning role:", roleError);
        }
      }

      toast.success("Registration successful! Please verify your email.");
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.info("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    }
  };

  const isAdmin = userRoles.includes('admin');

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        profile, 
        login, 
        signup, 
        logout, 
        isAdmin, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
