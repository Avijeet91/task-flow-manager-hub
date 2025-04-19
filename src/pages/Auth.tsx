
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { LoginFormData, RegisterFormData } from "@/types/auth";

const Auth = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to log in");
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsRegistering(true);
    
    try {
      // First check if user already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email);
      
      if (existingUsers && existingUsers.length > 0) {
        toast.error("An account with this email already exists");
        setIsRegistering(false);
        return;
      }

      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        toast.success("Registration successful! Please check your email to verify your account.");
        setActiveTab("login");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Task Manager</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm onSubmit={handleRegister} isRegistering={isRegistering} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
