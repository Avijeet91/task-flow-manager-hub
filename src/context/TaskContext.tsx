
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
  const { user } = useAuth();

  // Load tasks from database on initial load
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // Fetch tasks and comments from the database
  const fetchTasks = async () => {
    try {
      if (!user) return;
      
      // Fetch tasks from the database
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksError) {
        throw tasksError;
      }
      
      if (!tasksData) {
        return;
      }
      
      // Fetch all comments for tasks
      const { data: commentsData, error: commentsError } = await supabase
        .from('task_comments')
        .select('*')
        .order('created_at');
      
      if (commentsError) {
        throw commentsError;
      }
      
      // Map data to our interface format
      const formattedTasks: Task[] = tasksData.map((task) => {
        // Find all comments for this task
        const taskComments = commentsData?.filter((comment) => comment.task_id === task.id) || [];
        
        // Map comments to our interface format
        const formattedComments = taskComments.map((comment) => ({
          id: comment.id,
          userId: comment.user_id,
          userName: comment.user_name,
          text: comment.text,
          createdAt: comment.created_at
        }));
        
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
          comments: formattedComments
        };
      });
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

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
  const addTask = async (task: Omit<Task, "id" | "createdAt" | "comments">) => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can create tasks");
      return;
    }

    try {
      // Insert task into database
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          assigned_to: task.assignedTo,
          assigned_to_name: task.assignedToName,
          assigned_by: user.id,
          assigned_by_name: user.name,
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

  // Update a task
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Determine if status is changing to completed
      const isCompletingTask = updates.status === "completed";
      const currentTask = tasks.find(t => t.id === taskId);
      
      if (!currentTask) {
        toast.error("Task not found");
        return;
      }
      
      // Map our interface fields to database fields
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
      
      // Update task in database
      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      // Update local state with processed updates
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

  // Update task progress
  const updateTaskProgress = async (taskId: string, progress: number) => {
    if (progress < 0 || progress > 100) {
      toast.error("Progress must be between 0 and 100");
      return;
    }

    try {
      // Get current task to determine status changes
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) {
        toast.error("Task not found");
        return;
      }

      // Determine if status needs to change based on progress
      let newStatus = currentTask.status;
      let completedAt = currentTask.completedAt;
      
      if (progress === 100 && currentTask.status !== "completed") {
        newStatus = "completed";
        completedAt = new Date().toISOString();
      } else if (progress > 0 && currentTask.status === "pending") {
        newStatus = "in_progress";
      }

      // Update task in database
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

      // Update local state
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

  // Add a comment to a task
  const addTaskComment = async (taskId: string, commentText: string) => {
    if (!user) return;

    try {
      // Insert comment into database
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          user_name: user.name,
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

        // Update local state
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

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!user || user.role !== "admin") {
      toast.error("Only admins can delete tasks");
      return;
    }

    try {
      // Delete task from database
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      // Update local state
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

// Custom hook to use task context
export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
