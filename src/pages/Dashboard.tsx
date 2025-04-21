import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  CircleAlert 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTask } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { useEmployee } from "@/context/EmployeeContext";
import TaskCard from "@/components/TaskCard";
import TaskDebugInfo from "@/components/TaskDebugInfo";
import { toast } from "sonner";

const Dashboard = () => {
  const { getUserTasks, fetchTasks, tasks } = useTask();
  const { user, isAdmin, profile } = useAuth();
  const { employees } = useEmployee();
  const navigate = useNavigate();
  
  // Fetch tasks on mount and whenever user/profile changes
  useEffect(() => {
    const loadTasks = async () => {
      if (user) {
        console.log("Dashboard - Initiating task fetch");
        await fetchTasks();
        console.log("Dashboard - Tasks fetched successfully");
      }
    };
    
    loadTasks();
  }, [user, profile, fetchTasks]);
  
  // Get user's tasks with improved logging
  console.log("Dashboard - About to call getUserTasks()");
  const userTasks = getUserTasks();
  console.log("Dashboard - User tasks returned:", userTasks.length, userTasks);

  // Filter tasks by status
  const pendingTasks = userTasks.filter((task) => task.status === "pending");
  const inProgressTasks = userTasks.filter(
    (task) => task.status === "in_progress"
  );
  const completedTasks = userTasks.filter((task) => task.status === "completed");
  const overdueTasks = userTasks.filter((task) => task.status === "overdue");

  // Calculate statistics
  const totalTasks = userTasks.length;
  const completionRate = totalTasks
    ? Math.round((completedTasks.length / totalTasks) * 100)
    : 0;

  // Get recent tasks
  const recentTasks = [...userTasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Enhanced Debug info - will only show in development mode */}
      <TaskDebugInfo />
    
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Across all employees" : "Assigned to you"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks.length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <CircleAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>
              Monitor your team's task allocation and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.map((employee) => {
                const employeeTasks = tasks.filter(
                  (task) => task.assignedTo === employee.employeeId
                );
                const employeeCompletedTasks = employeeTasks.filter(
                  (task) => task.status === "completed"
                );
                const employeeCompletionRate = employeeTasks.length
                  ? Math.round(
                      (employeeCompletedTasks.length / employeeTasks.length) *
                        100
                    )
                  : 0;

                return (
                  <div key={employee.id} className="flex items-center">
                    <div className="w-1/4">
                      <p className="text-sm font-medium truncate">
                        {employee.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {employee.position}
                      </p>
                    </div>
                    <div className="w-1/4">
                      <p className="text-sm">
                        {employeeTasks.length} tasks
                      </p>
                    </div>
                    <div className="w-2/4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Completion Rate</span>
                        <span>{employeeCompletionRate}%</span>
                      </div>
                      <Progress value={employeeCompletionRate} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))}
          {recentTasks.length === 0 && (
            <p className="text-muted-foreground text-center col-span-full py-8">
              No tasks found. {isAdmin ? "Create a new task to get started." : "Your tasks will appear here."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
