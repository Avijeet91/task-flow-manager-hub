
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Clock,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTask, TaskStatus } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { getTaskById, updateTask, updateTaskProgress, addTaskComment, deleteTask } = useTask();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const task = getTaskById(taskId || "");

  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(task?.progress || 0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "pending",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
  });

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
        <p className="text-gray-500 mb-4">
          The task you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/tasks")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
      </div>
    );
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setProgress(value);
  };

  const handleProgressUpdate = () => {
    updateTaskProgress(task.id, progress);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addTaskComment(task.id, comment);
      setComment("");
    }
  };

  const handleEditSubmit = () => {
    updateTask(task.id, {
      title: editedTask.title,
      description: editedTask.description,
      status: editedTask.status as TaskStatus,
      priority: editedTask.priority as "low" | "medium" | "high",
      dueDate: new Date(editedTask.dueDate).toISOString(),
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteTask = () => {
    deleteTask(task.id);
    setIsDeleteDialogOpen(false);
    navigate("/tasks");
  };

  const getStatusColor = () => {
    switch (task.status) {
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

  const getPriorityColor = () => {
    switch (task.priority) {
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate("/tasks")}
          className="text-gray-500"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor()}>
                {task.status.replace("_", " ")}
              </Badge>
              <Badge className={getPriorityColor()}>
                {task.priority} priority
              </Badge>
            </div>
          </div>
          <p className="text-gray-700 mb-6">{task.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Assigned to</p>
                <p className="font-medium">{task.assignedToName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Due date</p>
                <p className="font-medium">{formatDate(task.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(task.createdAt)}</p>
              </div>
            </div>
            {task.completedAt && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="font-medium">{formatDate(task.completedAt)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Progress</h3>
              <span className="text-sm">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2 mb-2" />
            
            {/* Only show progress update controls to the assigned employee */}
            {!isAdmin && user?.employeeId === task.assignedTo && task.status !== "completed" && (
              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleProgressChange}
                  />
                </div>
                <Button onClick={handleProgressUpdate}>Update Progress</Button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" /> Comments
          </h3>

          <div className="space-y-4 mb-6">
            {task.comments.length > 0 ? (
              task.comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit}>
            <div className="flex flex-col md:flex-row gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!comment.trim()}>
                Post Comment
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
              />
            </div>
            <div className="grid w-full items-center gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={editedTask.description}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <Select
                  value={editedTask.status}
                  onValueChange={(value: string) =>
                    setEditedTask({ ...editedTask, status: value as TaskStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full items-center gap-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <Select
                  value={editedTask.priority}
                  onValueChange={(value: string) =>
                    setEditedTask({ ...editedTask, priority: value as "low" | "medium" | "high" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid w-full items-center gap-2">
              <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
              <Input
                id="dueDate"
                type="date"
                value={editedTask.dueDate}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
