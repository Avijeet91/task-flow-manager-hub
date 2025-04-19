
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { Settings as SettingsIcon } from "lucide-react";
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
import AppearanceForm from "@/components/settings/AppearanceForm";
import NotificationsForm from "@/components/settings/NotificationsForm";
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
import { useEmployee } from "@/context/EmployeeContext";
import { toast } from "sonner";

const SettingsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { settings, loading, saveSettings } = useSettings();
  const { employees, updateEmployee } = useEmployee();
  
  const currentEmployee = user?.employeeId 
    ? employees.find(emp => emp.employeeId === user.employeeId)
    : null;

  const accountForm = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      contact: currentEmployee?.contact || "",
    },
  });

  const onAccountSubmit = (data: any) => {
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
  
  const handleAppearanceSubmit = (values: any) => {
    if (settings) {
      saveSettings({
        ...settings,
        darkMode: values.darkMode,
        compactMode: values.compactMode,
        fontSize: values.fontSize,
      });
    }
  };

  const handleNotificationsSubmit = (values: any) => {
    if (settings) {
      saveSettings({
        ...settings,
        notifications: values.notifications,
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Ensure we have settings before rendering the form components
  if (!settings) {
    return <div className="flex justify-center items-center min-h-screen">Error loading settings</div>;
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>

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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsForm
                initialValues={{ notifications: settings.notifications }}
                onSubmit={handleNotificationsSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppearanceForm
                initialValues={{
                  darkMode: settings.darkMode,
                  compactMode: settings.compactMode,
                  fontSize: settings.fontSize,
                }}
                onSubmit={handleAppearanceSubmit}
              />
            </CardContent>
          </Card>
        </TabsContent>

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
