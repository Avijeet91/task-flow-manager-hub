
import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

interface NotificationsFormProps {
  initialValues: {
    notifications: {
      taskAssigned: boolean;
      taskUpdated: boolean;
      taskCompleted: boolean;
      commentAdded: boolean;
    };
  };
  onSubmit: (values: any) => void;
}

const NotificationsForm: React.FC<NotificationsFormProps> = ({ initialValues, onSubmit }) => {
  const form = useForm({
    defaultValues: initialValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="notifications.taskAssigned"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Task Assigned</FormLabel>
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
          control={form.control}
          name="notifications.taskUpdated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Task Updated</FormLabel>
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
          control={form.control}
          name="notifications.taskCompleted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Task Completed</FormLabel>
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
          control={form.control}
          name="notifications.commentAdded"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Comments</FormLabel>
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

        <Button type="submit" className="w-full">Save Notification Settings</Button>
      </form>
    </Form>
  );
};

export default NotificationsForm;
