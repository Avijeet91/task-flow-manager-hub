
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "comments">) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>;
  addTaskComment: (taskId: string, comment: string) => Promise<void>;
  getUserTasks: (employeeId?: string) => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  deleteTask: (taskId: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      if (!user) return;
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksError) throw tasksError;
      if (!tasksData) return;

      console.log("Fetched tasks:", tasksData);
      
      const { data: commentsData, error: commentsError } = await supabase
        .from('task_comments')
        .select('*')
        .order('created_at');
      
      if (commentsError) throw commentsError;

      const formattedTasks: Task[] = tasksData.map((task) => {
        const taskComments = commentsData?.filter(c => c.task_id === task.id) || [];
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          assignedTo: task.assigned_to,
          assignedToName: task.assigned_to_name,
          assignedBy: task.assigned_by,
          assignedByName: task.assigned_by_name,
          status: task.status as TaskStatus,
          priority: task.priority as "low" | "medium" | "high",
          createdAt: task.created_at,
          dueDate: task.due_date,
          completedAt: task.completed_at,
          progress: task.progress,
          comments: taskComments.map(comment => ({
            id: comment.id,
            userId: comment.user_id,
            userName: comment.user_name,
            text: comment.text,
            createdAt: comment.created_at
          }))
        };
      });
      
      setTasks(formattedTasks);
      console.log("Formatted and set tasks:", formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const getUserTasks = (employeeId?: string) => {
    if (!user) return [];

    // For debugging
    console.log("Getting tasks for user:", user);
    console.log("User profile:", profile);
    console.log("User role:", user.role);
    console.log("Employee ID from params:", employeeId);
    console.log("User employee ID:", user.employeeId);
    console.log("Profile employee ID:", profile?.employee_id);
    console.log("All tasks:", tasks);

    if (user.role === "admin") {
      return employeeId
        ? tasks.filter((task) => task.assignedTo === employeeId)
        : tasks;
    } else {
      // Get all possible IDs this employee might be identified by
      const possibleEmployeeIds = [
        user.id, // UUID
        user.employeeId, // Employee ID from user object
        profile?.employee_id, // Employee ID from profile
        employeeId, // Employee ID from function params
        user.email?.split('@')[0], // Username part of email as fallback
      ].filter(Boolean) as string[];
      
      console.log("Possible employee IDs to check:", possibleEmployeeIds);
      
      // Find tasks assigned to any of the possible IDs (with improved matching)
      const employeeTasks = tasks.filter((task) => {
        // Direct matching (any of the possible IDs matches exactly with task.assignedTo)
        const directMatch = possibleEmployeeIds.some(id => 
          task.assignedTo === id
        );
        
        // Case-insensitive matching
        const caseInsensitiveMatch = possibleEmployeeIds.some(id => 
          task.assignedTo.toLowerCase() === id.toLowerCase()
        );
        
        // Partial matching (task.assignedTo contains any of the possible IDs)
        const partialMatch = possibleEmployeeIds.some(id => 
          task.assignedTo.includes(id)
        );
        
        return directMatch || caseInsensitiveMatch || partialMatch;
      });
      
      console.log("Filtered employee tasks:", employeeTasks);
      return employeeTasks;
    }
  };

  const getTaskById = (taskId: string) => {
    return tasks.find((task) => task.id === taskId);
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "comments">) => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can create tasks");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          assigned_to: task.assignedTo,
          assigned_to_name: task.assignedToName,
          assigned_by: user.id,
          assigned_by_name: user.name || 'Admin', // Use the user.name from our extended user with fallback
          status: task.status,
          priority: task.priority,
          due_date: task.dueDate,
          progress: task.progress
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          assignedTo: data.assigned_to,
          assignedToName: data.assigned_to_name,
          assignedBy: data.assigned_by,
          assignedByName: data.assigned_by_name,
          status: data.status as TaskStatus,
          priority: data.priority as "low" | "medium" | "high",
          createdAt: data.created_at,
          dueDate: data.due_date,
          completedAt: data.completed_at,
          progress: data.progress,
          comments: []
        };

        setTasks(prevTasks => [...prevTasks, newTask]);
        toast.success("Task created successfully");
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const isCompletingTask = updates.status === "completed";
      const currentTask = tasks.find(t => t.id === taskId);
      
      if (!currentTask) {
        toast.error("Task not found");
        return;
      }
      
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
      if (isCompletingTask) {
        dbUpdates.completed_at = new Date().toISOString();
        dbUpdates.progress = 100;
      } else if (updates.progress !== undefined) {
        dbUpdates.progress = updates.progress;
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      const finalUpdates = {
        ...updates,
        completedAt: isCompletingTask ? new Date().toISOString() : updates.completedAt,
        progress: isCompletingTask ? 100 : updates.progress
      };

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, ...finalUpdates } : task
        )
      );
      
      toast.success("Task updated successfully");
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const updateTaskProgress = async (taskId: string, progress: number) => {
    if (progress < 0 || progress > 100) {
      toast.error("Progress must be between 0 and 100");
      return;
    }

    try {
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) {
        toast.error("Task not found");
        return;
      }

      let newStatus = currentTask.status;
      let completedAt = currentTask.completedAt;
      
      if (progress === 100 && currentTask.status !== "completed") {
        newStatus = "completed";
        completedAt = new Date().toISOString();
      } else if (progress > 0 && currentTask.status === "pending") {
        newStatus = "in_progress";
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          progress: progress,
          status: newStatus,
          completed_at: newStatus === "completed" ? completedAt : null
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                progress,
                status: newStatus as TaskStatus,
                completedAt: newStatus === "completed" && !task.completedAt
                  ? new Date().toISOString()
                  : task.completedAt
              }
            : task
        )
      );
      
      toast.success("Progress updated");
    } catch (error) {
      console.error('Error updating task progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const addTaskComment = async (taskId: string, commentText: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          user_name: user.name || 'Anonymous', // Use the user.name from our extended user with fallback
          text: commentText
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newComment = {
          id: data.id,
          userId: data.user_id,
          userName: data.user_name,
          text: data.text,
          createdAt: data.created_at
        };

        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? { ...task, comments: [...task.comments, newComment] }
              : task
          )
        );
        
        toast.success("Comment added");
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can delete tasks");
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success("Task deleted");
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
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
        fetchTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
