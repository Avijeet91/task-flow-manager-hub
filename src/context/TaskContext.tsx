
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// Define task status types
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";

// Define Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // employee ID
  assignedToName: string; // employee name
  assignedBy: string; // admin ID
  assignedByName: string; // admin name
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  createdAt: string; // ISO string
  dueDate: string; // ISO string
  completedAt?: string; // ISO string, optional
  progress: number; // 0-100
  comments: {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
  }[];
}

// Mock tasks data
const initialTasks: Task[] = [
  {
    id: "task1",
    title: "Complete quarterly report",
    description: "Prepare and submit the quarterly financial report including all expenditures and revenue.",
    assignedTo: "EMP001",
    assignedToName: "John Employee",
    assignedBy: "1",
    assignedByName: "Admin User",
    status: "in_progress",
    priority: "high",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    progress: 60,
    comments: [
      {
        id: "comment1",
        userId: "1",
        userName: "Admin User",
        text: "Please make sure to include the new marketing expenses.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "comment2",
        userId: "2",
        userName: "John Employee",
        text: "I've included those expenses and am now working on the revenue section.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "task2",
    title: "Update website content",
    description: "Update the company website with new product information and team member profiles.",
    assignedTo: "EMP002",
    assignedToName: "Jane Employee",
    assignedBy: "1",
    assignedByName: "Admin User",
    status: "pending",
    priority: "medium",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    progress: 0,
    comments: [],
  },
  {
    id: "task3",
    title: "Client presentation preparation",
    description: "Prepare slides and materials for the upcoming client presentation.",
    assignedTo: "EMP001",
    assignedToName: "John Employee",
    assignedBy: "1",
    assignedByName: "Admin User",
    status: "completed",
    priority: "high",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    progress: 100,
    comments: [
      {
        id: "comment3",
        userId: "2",
        userName: "John Employee",
        text: "I've completed the presentation ahead of schedule. Please review when you have time.",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "comment4",
        userId: "1",
        userName: "Admin User",
        text: "Excellent work! The client will be impressed.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "task4",
    title: "Inventory management",
    description: "Conduct monthly inventory count and update the inventory management system.",
    assignedTo: "EMP002",
    assignedToName: "Jane Employee",
    assignedBy: "1",
    assignedByName: "Admin User",
    status: "overdue",
    priority: "high",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    progress: 40,
    comments: [
      {
        id: "comment5",
        userId: "1",
        userName: "Admin User",
        text: "This task is now overdue. Please provide an update on your progress.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "comments">) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  addTaskComment: (taskId: string, comment: string) => void;
  getUserTasks: (employeeId?: string) => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  deleteTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { user } = useAuth();

  // Load tasks from localStorage on initial load
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks");
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error("Failed to parse stored tasks:", error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Get all tasks for the current user
  const getUserTasks = (employeeId?: string) => {
    if (!user) return [];

    if (user.role === "admin") {
      // If an employeeId is provided, filter tasks for that employee
      return employeeId
        ? tasks.filter((task) => task.assignedTo === employeeId)
        : tasks;
    } else {
      // For employees, only show their assigned tasks
      return tasks.filter((task) => task.assignedTo === user.employeeId);
    }
  };

  // Get a specific task by ID
  const getTaskById = (taskId: string) => {
    return tasks.find((task) => task.id === taskId);
  };

  // Add a new task
  const addTask = (task: Omit<Task, "id" | "createdAt" | "comments">) => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can create tasks");
      return;
    }

    const newTask: Task = {
      id: `task${Date.now()}`,
      createdAt: new Date().toISOString(),
      comments: [],
      ...task,
      assignedBy: user.id,
      assignedByName: user.name,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success("Task created successfully");
  };

  // Update a task
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updates,
              ...(updates.status === "completed" && task.status !== "completed"
                ? { completedAt: new Date().toISOString(), progress: 100 }
                : {}),
            }
          : task
      )
    );
    toast.success("Task updated successfully");
  };

  // Update task progress
  const updateTaskProgress = (taskId: string, progress: number) => {
    if (progress < 0 || progress > 100) {
      toast.error("Progress must be between 0 and 100");
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress,
              ...(progress === 100 && task.status !== "completed"
                ? { status: "completed", completedAt: new Date().toISOString() }
                : progress > 0 && task.status === "pending"
                ? { status: "in_progress" }
                : {}),
            }
          : task
      )
    );
    toast.success("Progress updated");
  };

  // Add a comment to a task
  const addTaskComment = (taskId: string, commentText: string) => {
    if (!user) return;

    const newComment = {
      id: `comment${Date.now()}`,
      userId: user.id,
      userName: user.name,
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, comments: [...task.comments, newComment] }
          : task
      )
    );
    toast.success("Comment added");
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can delete tasks");
      return;
    }

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted");
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        updateTaskProgress,
        addTaskComment,
        getUserTasks,
        getTaskById,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use task context
export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
