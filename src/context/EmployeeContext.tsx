
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

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

// Mock employees data
const initialEmployees: Employee[] = [
  {
    id: "2",
    employeeId: "EMP001",
    name: "John Employee",
    email: "john@example.com",
    position: "Senior Developer",
    department: "Engineering",
    joinDate: "2022-01-15",
    contact: "+1234567890",
  },
  {
    id: "3",
    employeeId: "EMP002",
    name: "Jane Employee",
    email: "jane@example.com",
    position: "Marketing Specialist",
    department: "Marketing",
    joinDate: "2022-03-10",
    contact: "+1987654321",
  },
];

interface EmployeeContextType {
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => void;
  deleteEmployee: (employeeId: string) => void;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  getEmployeeByUserId: (userId: string) => Employee | undefined;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const { user, isAdmin } = useAuth();

  // Load employees from localStorage on initial load
  useEffect(() => {
    const storedEmployees = localStorage.getItem("employees");
    if (storedEmployees) {
      try {
        setEmployees(JSON.parse(storedEmployees));
      } catch (error) {
        console.error("Failed to parse stored employees:", error);
      }
    }
  }, []);

  // Save employees to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  // Get an employee by their employeeId
  const getEmployeeById = (employeeId: string) => {
    return employees.find((emp) => emp.employeeId === employeeId);
  };

  // Get an employee by their userId
  const getEmployeeByUserId = (userId: string) => {
    return employees.find((emp) => emp.id === userId);
  };

  // Add a new employee
  const addEmployee = (employee: Omit<Employee, "id">) => {
    if (!isAdmin) {
      toast.error("Only admins can add employees");
      return;
    }

    // Check if employee ID already exists
    if (employees.some((emp) => emp.employeeId === employee.employeeId)) {
      toast.error("Employee ID already exists");
      return;
    }

    // Generate a unique user ID
    const newId = `user${Date.now()}`;
    
    const newEmployee: Employee = {
      id: newId,
      ...employee,
    };

    setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
    toast.success("Employee added successfully");
  };

  // Update an employee
  const updateEmployee = (employeeId: string, updates: Partial<Employee>) => {
    if (!isAdmin) {
      toast.error("Only admins can update employees");
      return;
    }

    // Check if updating to an existing employee ID
    if (
      updates.employeeId &&
      updates.employeeId !== employeeId &&
      employees.some((emp) => emp.employeeId === updates.employeeId)
    ) {
      toast.error("Employee ID already exists");
      return;
    }

    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, ...updates } : emp
      )
    );
    toast.success("Employee updated successfully");
  };

  // Delete an employee
  const deleteEmployee = (employeeId: string) => {
    if (!isAdmin) {
      toast.error("Only admins can delete employees");
      return;
    }

    setEmployees((prevEmployees) =>
      prevEmployees.filter((emp) => emp.employeeId !== employeeId)
    );
    toast.success("Employee deleted successfully");
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
