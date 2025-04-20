import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import bcrypt from "bcryptjs";

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  position: string;
  department: string;
  joinDate: string;
  contact: string;
}

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  getEmployeeByUserId: (userId: string) => Employee | undefined;
  fetchEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedEmployees: Employee[] = data.map((emp) => ({
          id: emp.id,
          employeeId: emp.employee_id,
          name: emp.name,
          email: emp.email,
          position: emp.position || '',
          department: emp.department || '',
          joinDate: emp.join_date || new Date().toISOString().split('T')[0],
          contact: emp.contact || '',
        }));
        
        setEmployees(formattedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          employee_id: employee.employeeId,
          name: employee.name,
          email: employee.email,
          password: await bcrypt.hash('password123', 10),
          position: employee.position,
          department: employee.department,
          join_date: employee.joinDate,
          contact: employee.contact
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newEmployee: Employee = {
          id: data.id,
          employeeId: data.employee_id,
          name: data.name,
          email: data.email,
          position: data.position || '',
          department: data.department || '',
          joinDate: data.join_date || new Date().toISOString().split('T')[0],
          contact: data.contact || '',
        };

        setEmployees(prev => [...prev, newEmployee]);
        toast.success("Employee added successfully");
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.position) dbUpdates.position = updates.position;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.joinDate) dbUpdates.join_date = updates.joinDate;
      if (updates.contact) dbUpdates.contact = updates.contact;

      const { error } = await supabase
        .from('employees')
        .update(dbUpdates)
        .eq('employee_id', employeeId);

      if (error) {
        throw error;
      }

      setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.employeeId === employeeId ? { ...emp, ...updates } : emp
        )
      );

      toast.success("Employee updated successfully");
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('employee_id', employeeId);

      if (error) {
        throw error;
      }

      setEmployees(prevEmployees =>
        prevEmployees.filter(emp => emp.employeeId !== employeeId)
      );

      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const getEmployeeById = (employeeId: string) => {
    return employees.find((emp) => emp.employeeId === employeeId);
  };

  const getEmployeeByUserId = (userId: string) => {
    return employees.find((emp) => emp.id === userId);
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
        getEmployeeByUserId,
        fetchEmployees
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
};
