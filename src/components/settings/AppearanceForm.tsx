
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface AppearanceFormProps {
  initialValues: {
    darkMode: boolean;
    compactMode: boolean;
    fontSize: string;
  };
  onSubmit: (values: any) => void;
}

const AppearanceForm: React.FC<AppearanceFormProps> = ({ initialValues, onSubmit }) => {
  const form = useForm({
    defaultValues: initialValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="darkMode"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Dark Mode</FormLabel>
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
          name="compactMode"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div>
                <FormLabel>Compact Mode</FormLabel>
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
          name="fontSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font Size</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">Save Appearance Settings</Button>
      </form>
    </Form>
  );
};

export default AppearanceForm;
