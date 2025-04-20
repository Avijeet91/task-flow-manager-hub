
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

// Define types for our users
export type UserRole = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string; // Only required for employees
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (saved in localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function - authenticate against the database
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Get employee from the database using a custom RPC function
      const { data, error } = await supabase.rpc('get_employee_by_email', { email_param: email });
      
      if (error || !data || !data[0]) {
        toast.error("Invalid email or password");
        setIsLoading(false);
        return false;
      }

      const employee = data[0];

      // Compare password
      const passwordMatch = await bcrypt.compare(password, employee.password);
      
      if (!passwordMatch) {
        toast.error("Invalid email or password");
        setIsLoading(false);
        return false;
      }

      // Create user object from employee data
      const userObj: User = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.position === 'Administrator' ? 'admin' : 'employee',
        employeeId: employee.employee_id
      };

      // Save user data to session
      setUser(userObj);
      localStorage.setItem("user", JSON.stringify(userObj));
      
      // Create a Supabase session (for RLS policies)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password 
      });

      if (authError) {
        console.error("Supabase auth error:", authError);
        // Continue anyway since we've already verified the user
      }

      toast.success("Login successful!");
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("user");
      toast.info("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoading }}>
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
