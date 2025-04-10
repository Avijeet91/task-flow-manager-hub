
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTask } from "@/context/TaskContext";
import { useEmployee } from "@/context/EmployeeContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const CreateTask = () => {
  const { addTask } = useTask();
  const { employees } = useEmployee();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedToName: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    progress: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "assignedTo") {
      const selectedEmployee = employees.find((emp) => emp.employeeId === value);
      setFormData((prev) => ({
        ...prev,
        assignedTo: value,
        assignedToName: selectedEmployee ? selectedEmployee.name : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.assignedTo || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // We need to provide assignedBy and assignedByName
    addTask({
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      assignedToName: formData.assignedToName,
      assignedBy: user?.id || "", // Add missing property
      assignedByName: user?.name || "", // Add missing property
      status: formData.status as any,
      priority: formData.priority as any,
      dueDate: new Date(formData.dueDate).toISOString(),
      progress: 0,
    });

    navigate("/tasks");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/tasks")}
          className="text-gray-500"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Tasks
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Task Title *
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description *
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter task description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="assignedTo" className="text-sm font-medium">
                  Assign To *
                </label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => handleSelectChange("assignedTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.employeeId}
                        value={employee.employeeId}
                      >
                        {employee.name} ({employee.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date *
                </label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange("priority", value)}
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

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tasks")}
              >
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTask;
