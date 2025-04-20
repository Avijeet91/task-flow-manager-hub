
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
      const { data, error } = await supabase.rpc('get_all_employees');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Map database format to our interface format
        const formattedEmployees: Employee[] = data.map((emp: any) => ({
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
      const { data, error } = await supabase.rpc('add_employee', {
        employee_id_param: employee.employeeId,
        name_param: employee.name,
        email_param: employee.email,
        password_param: await bcrypt.hash('password123', 10), // Default password, should be changed
        position_param: employee.position,
        department_param: employee.department,
        join_date_param: employee.joinDate,
        contact_param: employee.contact
      });

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        const emp = data[0];
        const newEmployee: Employee = {
          id: emp.id,
          employeeId: emp.employee_id,
          name: emp.name,
          email: emp.email,
          position: emp.position || '',
          department: emp.department || '',
          joinDate: emp.join_date || new Date().toISOString().split('T')[0],
          contact: emp.contact || '',
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

      // Update employee in database
      const { error } = await supabase.rpc('update_employee', {
        employee_id_param: employeeId,
        name_param: updates.name,
        email_param: updates.email,
        position_param: updates.position,
        department_param: updates.department,
        join_date_param: updates.joinDate,
        contact_param: updates.contact
      });

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
      const { error } = await supabase.rpc('delete_employee', {
        employee_id_param: employeeId
      });

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
