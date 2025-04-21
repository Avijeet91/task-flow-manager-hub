
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTask, TaskStatus } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import TaskCard from "@/components/TaskCard";
import TaskDebugInfo from "@/components/TaskDebugInfo";
import { Plus, Search, Filter } from "lucide-react";

const Tasks = () => {
  const { getUserTasks, fetchTasks, tasks } = useTask();
  const { isAdmin, user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Refresh tasks when component mounts
    fetchTasks();
    
    // Log debug info to help diagnose task assignment issues
    console.log("Tasks page - Current user:", user);
    console.log("Tasks page - Current profile:", profile);
    console.log("Tasks page - Is admin:", isAdmin);
    console.log("Tasks page - All tasks:", tasks);
  }, []);
  
  // Force a refresh of tasks when user or profile changes
  useEffect(() => {
    if (user && profile) {
      console.log("User or profile changed, refreshing tasks");
      fetchTasks();
    }
  }, [user, profile]);
  
  const allTasks = getUserTasks();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("dueDate");

  // Filter and sort tasks
  const filteredTasks = allTasks
    .filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) || 
        task.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || task.status === statusFilter;
      
      const matchesPriority = 
        priorityFilter === "all" || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - 
                 priorityOrder[b.priority as keyof typeof priorityOrder];
        case "status":
          const statusOrder = { overdue: 0, pending: 1, in_progress: 2, completed: 3 };
          return statusOrder[a.status as keyof typeof statusOrder] - 
                 statusOrder[b.status as keyof typeof statusOrder];
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{isAdmin ? "All Tasks" : "My Tasks"}</h1>
        {isAdmin && (
          <Button onClick={() => navigate("/tasks/create")}>
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Button>
        )}
      </div>

      {/* Debug info - will only show in development mode */}
      <TaskDebugInfo />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No tasks found.</p>
            {isAdmin && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate("/tasks/create")}
              >
                <Plus className="mr-2 h-4 w-4" /> Create a new task
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
