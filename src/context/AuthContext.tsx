
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

// Extended user type with the properties we need
export interface ExtendedUser extends User {
  employeeId?: string;
  name?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: ExtendedUser | null;
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
  const [user, setUser] = useState<ExtendedUser | null>(null);
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
        
        if (newSession?.user) {
          // Create extended user with the properties our app expects
          const extendedUser = {
            ...newSession.user
          } as ExtendedUser;
          setUser(extendedUser);
          
          // Defer profile fetching to avoid blocking auth flow
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
            fetchUserRoles(newSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          setUserRoles([]);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession?.user) {
          // Create extended user with the properties our app expects
          const extendedUser = {
            ...initialSession.user
          } as ExtendedUser;
          setUser(extendedUser);
          
          await fetchUserProfile(initialSession.user.id);
          await fetchUserRoles(initialSession.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        // Always set loading to false even if there are errors
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // This effect updates the extended user properties after profile and roles are fetched
  useEffect(() => {
    if (user && profile) {
      console.log("Updating extended user with profile:", profile);
      setUser(prevUser => {
        if (!prevUser) return null;
        
        return {
          ...prevUser,
          employeeId: profile.employee_id,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          role: isAdmin ? "admin" : "employee"
        };
      });
    }
  }, [profile, userRoles]);

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
        console.log("Fetched user profile:", data);
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
    } finally {
      // Set loading to false after roles have been fetched
      // This ensures we have all the necessary data before proceeding
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }

      toast.success("Login successful");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      setIsLoading(false);
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
      setIsLoading(true);
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
        setIsLoading(false);
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
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.info("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    } finally {
      setIsLoading(false);
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
