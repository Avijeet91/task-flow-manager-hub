
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEmployee } from "@/context/EmployeeContext";
import { toast } from "sonner";
import {
  Card,
  CardContent,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { Settings } from "lucide-react";
import { loadUserSettings, saveUserSettings, UserSettings } from "@/utils/settingsStorage";

const SettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { employees, updateEmployee } = useEmployee();
  
  const [activeTab, setActiveTab] = useState("account");
  const [userSettings, setUserSettings] = useState<UserSettings>({
    darkMode: false,
    compactMode: false,
    fontSize: 'medium',
    notifications: {
      taskAssigned: true,
      taskUpdated: true,
      taskCompleted: true,
      commentAdded: true,
    }
  });

  // Load user settings on component mount
  useEffect(() => {
    if (user) {
      const settings = loadUserSettings(user.id);
      setUserSettings(settings);
    }
  }, [user]);

  // Get current employee data if the user is an employee
  const currentEmployee = user?.employeeId 
    ? employees.find(emp => emp.employeeId === user.employeeId)
    : null;

  // Form setup for account settings
  const accountForm = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      contact: currentEmployee?.contact || "",
    },
  });

  // Form setup for appearance settings
  const appearanceForm = useForm({
    defaultValues: {
      compactMode: userSettings.compactMode || false,
      darkMode: userSettings.darkMode || false,
      fontSize: userSettings.fontSize || "medium",
    },
  });

  // Update appearance form values when userSettings change
  useEffect(() => {
    appearanceForm.reset({
      compactMode: userSettings.compactMode || false,
      darkMode: userSettings.darkMode || false,
      fontSize: userSettings.fontSize || "medium",
    });
  }, [userSettings, appearanceForm]);

  // Handle account settings submission
  const onAccountSubmit = (data: any) => {
    // In a real app, this would update user data in the backend
    if (currentEmployee && user?.employeeId) {
      updateEmployee(user.employeeId, {
        name: data.name,
        email: data.email,
        contact: data.contact,
      });
      toast.success("Account settings updated successfully");
    } else {
      toast.success("Account settings would be updated (mock)");
    }
  };

  // Handle appearance settings submission
  const onAppearanceSubmit = (data: any) => {
    if (user) {
      const updatedSettings = {
        ...userSettings,
        darkMode: data.darkMode,
        compactMode: data.compactMode,
        fontSize: data.fontSize,
      };
      saveUserSettings(user.id, updatedSettings);
      setUserSettings(updatedSettings);
      toast.success("Appearance settings updated successfully");
    }
  };

  // Handle notification toggle
  const toggleNotification = (key: string) => {
    if (!user) return;
    
    const updatedNotifications = {
      ...userSettings.notifications,
      [key]: !userSettings.notifications?.[key as keyof typeof userSettings.notifications],
    };
    
    const updatedSettings = {
      ...userSettings,
      notifications: updatedNotifications,
    };
    
    saveUserSettings(user.id, updatedSettings);
    setUserSettings(updatedSettings);
    
    const isEnabled = !userSettings.notifications?.[key as keyof typeof userSettings.notifications];
    toast.success(`${key} notifications ${isEnabled ? "enabled" : "disabled"}`);
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Task Assigned</h3>
                    <p className="text-sm text-muted-foreground">
                      Notify when a new task is assigned to you
                    </p>
                  </div>
                  <Switch 
                    checked={userSettings.notifications?.taskAssigned} 
                    onCheckedChange={() => toggleNotification("taskAssigned")} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Task Updated</h3>
                    <p className="text-sm text-muted-foreground">
                      Notify when a task you're assigned to is updated
                    </p>
                  </div>
                  <Switch 
                    checked={userSettings.notifications?.taskUpdated} 
                    onCheckedChange={() => toggleNotification("taskUpdated")} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Task Completed</h3>
                    <p className="text-sm text-muted-foreground">
                      Notify when a task is marked as completed
                    </p>
                  </div>
                  <Switch 
                    checked={userSettings.notifications?.taskCompleted} 
                    onCheckedChange={() => toggleNotification("taskCompleted")} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Comments</h3>
                    <p className="text-sm text-muted-foreground">
                      Notify when someone comments on your tasks
                    </p>
                  </div>
                  <Switch 
                    checked={userSettings.notifications?.commentAdded} 
                    onCheckedChange={() => toggleNotification("commentAdded")} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appearanceForm}>
                <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-4">
                  <FormField
                    control={appearanceForm.control}
                    name="darkMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div>
                          <FormLabel>Dark Mode</FormLabel>
                          <FormDescription>
                            Switch between light and dark theme
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appearanceForm.control}
                    name="compactMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div>
                          <FormLabel>Compact Mode</FormLabel>
                          <FormDescription>
                            Use a more compact layout to fit more content
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Preferences</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings (Admin Only) */}
        {isAdmin && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure global system settings (Admin only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Enable Employee Registration</h3>
                      <p className="text-sm text-muted-foreground">
                        Allow employees to self-register
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Task Approval Required</h3>
                      <p className="text-sm text-muted-foreground">
                        Require admin approval to mark tasks as completed
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-assign Tasks</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically distribute tasks based on workload
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  
                  <Button variant="default">Save System Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;
