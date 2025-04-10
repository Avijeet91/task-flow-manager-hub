
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployee, Employee } from "@/context/EmployeeContext";
import { useTask } from "@/context/TaskContext";
import { Plus, Search, Mail, Phone, Edit, Trash2, MoreVertical, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const Employees = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployee();
  const { getUserTasks } = useTask();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    position: "",
    department: "",
    joinDate: "",
    contact: "",
  });

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = () => {
    addEmployee(formData);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditEmployee = () => {
    if (selectedEmployee) {
      updateEmployee(selectedEmployee.employeeId, formData);
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      resetForm();
    }
  };

  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.employeeId);
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      joinDate: employee.joinDate,
      contact: employee.contact,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      position: "",
      department: "",
      joinDate: "",
      contact: "",
    });
  };

  const getEmployeeTasks = (employeeId: string) => {
    return getUserTasks(employeeId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search employees..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => {
            const employeeTasks = getEmployeeTasks(employee.employeeId);
            const pendingTasks = employeeTasks.filter(
              (task) => task.status === "pending" || task.status === "in_progress"
            ).length;
            const completedTasks = employeeTasks.filter(
              (task) => task.status === "completed"
            ).length;
            const overdueTasks = employeeTasks.filter(
              (task) => task.status === "overdue"
            ).length;

            return (
              <Card key={employee.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/tasks?employee=${employee.employeeId}`)}
                        >
                          <User className="mr-2 h-4 w-4" /> View Tasks
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(employee)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Badge variant="outline">ID: {employee.employeeId}</Badge>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{employee.contact}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Department:</span>{" "}
                      {employee.department}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Join Date:</span>{" "}
                      {format(new Date(employee.joinDate), "MMMM d, yyyy")}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Tasks: {employeeTasks.length}</span>
                      <div className="space-x-2">
                        <Badge variant="outline" className="bg-yellow-50">
                          {pendingTasks} pending
                        </Badge>
                        <Badge variant="outline" className="bg-green-50">
                          {completedTasks} completed
                        </Badge>
                        {overdueTasks > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-600">
                            {overdueTasks} overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No employees found.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add an employee
            </Button>
          </div>
        )}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="employeeId" className="text-sm font-medium">
                  Employee ID *
                </label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  placeholder="EMP001"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="position" className="text-sm font-medium">
                  Position *
                </label>
                <Input
                  id="position"
                  name="position"
                  placeholder="Software Developer"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="department" className="text-sm font-medium">
                  Department *
                </label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="joinDate" className="text-sm font-medium">
                  Join Date *
                </label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="contact" className="text-sm font-medium">
                  Contact Number *
                </label>
                <Input
                  id="contact"
                  name="contact"
                  placeholder="+1234567890"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-employeeId" className="text-sm font-medium">
                  Employee ID *
                </label>
                <Input
                  id="edit-employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
              <div>
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Full Name *
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="edit-email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-position" className="text-sm font-medium">
                  Position *
                </label>
                <Input
                  id="edit-position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-department" className="text-sm font-medium">
                  Department *
                </label>
                <Input
                  id="edit-department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-joinDate" className="text-sm font-medium">
                  Join Date *
                </label>
                <Input
                  id="edit-joinDate"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-contact" className="text-sm font-medium">
                  Contact Number *
                </label>
                <Input
                  id="edit-contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
