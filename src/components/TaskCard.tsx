
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Task, TaskStatus } from "@/context/TaskContext";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return "task-pending";
      case "in_progress":
        return "task-in-progress";
      case "completed":
        return "task-completed";
      case "overdue":
        return "task-overdue";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card 
      className={`task-card cursor-pointer hover:shadow-md ${getStatusClass(task.status)}`} 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace("_", " ")}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-500">
          Assigned to: {task.assignedToName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 line-clamp-2">{task.description}</p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          <span>Created {formatDate(task.createdAt)}</span>
        </div>
        <div className="flex items-center">
          <CalendarDays className="w-3 h-3 mr-1" />
          <span>Due {formatDate(task.dueDate)}</span>
        </div>
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
