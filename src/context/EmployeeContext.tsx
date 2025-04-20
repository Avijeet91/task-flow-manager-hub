
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
  const { user, isAdmin } = useAuth();

  // Load employees from database on initial load
  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  // Fetch employees from the database
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
        // Map database format to our interface format
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

  // Get an employee by their employeeId
  const getEmployeeById = (employeeId: string) => {
    return employees.find((emp) => emp.employeeId === employeeId);
  };

  // Get an employee by their userId
  const getEmployeeByUserId = (userId: string) => {
    return employees.find((emp) => emp.id === userId);
  };

  // Add a new employee
  const addEmployee = async (employee: Omit<Employee, "id">) => {
    if (!isAdmin) {
      toast.error("Only admins can add employees");
      return;
    }

    try {
      // Check if employee ID already exists
      if (employees.some((emp) => emp.employeeId === employee.employeeId)) {
        toast.error("Employee ID already exists");
        return;
      }

      // Insert employee into database
      const { data, error } = await supabase
        .from('employees')
        .insert({
          employee_id: employee.employeeId,
          name: employee.name,
          email: employee.email,
          password: await bcrypt.hash('password123', 10), // Default password, should be changed
          position: employee.position,
          department: employee.department,
          join_date: employee.joinDate,
          contact: employee.contact
        })
        .select('*')
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

  // Update an employee
  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    if (!isAdmin) {
      toast.error("Only admins can update employees");
      return;
    }

    try {
      // Check if updating to an existing employee ID
      if (
        updates.employeeId &&
        updates.employeeId !== employeeId &&
        employees.some((emp) => emp.employeeId === updates.employeeId)
      ) {
        toast.error("Employee ID already exists");
        return;
      }

      // Map our interface fields to database fields
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.position) dbUpdates.position = updates.position;
      if (updates.department) dbUpdates.department = updates.department;
      if (updates.joinDate) dbUpdates.join_date = updates.joinDate;
      if (updates.contact) dbUpdates.contact = updates.contact;
      
      // Update employee in database
      const { error } = await supabase
        .from('employees')
        .update(dbUpdates)
        .eq('employee_id', employeeId);

      if (error) {
        throw error;
      }

      // Update local state
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

  // Delete an employee
  const deleteEmployee = async (employeeId: string) => {
    if (!isAdmin) {
      toast.error("Only admins can delete employees");
      return;
    }

    try {
      // Delete employee from database
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('employee_id', employeeId);

      if (error) {
        throw error;
      }

      // Update local state
      setEmployees(prevEmployees =>
        prevEmployees.filter(emp => emp.employeeId !== employeeId)
      );
      
      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
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

// Custom hook to use employee context
export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
};
