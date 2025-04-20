
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useTask } from "@/context/TaskContext";
import { Mail, User, Calendar, Briefcase, Building, Phone, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  const { user, profile, isAdmin } = useAuth();
  const { getUserTasks } = useTask();

  if (!user) return null;
  
  const isEmployee = !isAdmin;
  const userTasks = getUserTasks(profile?.employee_id);
  
  const completedTasks = userTasks.filter((task) => task.status === "completed").length;
  const pendingTasks = userTasks.filter((task) => task.status === "pending").length;
  const inProgressTasks = userTasks.filter((task) => task.status === "in_progress").length;
  const overdueTasks = userTasks.filter((task) => task.status === "overdue").length;
  
  const completionRate = userTasks.length ? Math.round((completedTasks / userTasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-16 w-16 text-gray-500" />
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">
                  {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
                </h2>
                <p className="text-gray-500">{isEmployee ? "Employee" : "Administrator"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{user.email}</span>
                </div>

                {profile && (
                  <>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{profile.contact || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{profile.position || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{profile.department || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Employee ID: {profile.employee_id || 'N/A'}</span>
                    </div>
                    {profile.join_date && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Joined: {format(new Date(profile.join_date), "MMMM d, yyyy")}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-xl font-bold">{userTasks.length}</div>
                  <div className="text-sm text-gray-500">Total Tasks</div>
                </div>
                <div className="border rounded-lg p-4 text-center bg-blue-50">
                  <div className="text-xl font-bold text-blue-600">{inProgressTasks}</div>
                  <div className="text-sm text-blue-600">In Progress</div>
                </div>
                <div className="border rounded-lg p-4 text-center bg-green-50">
                  <div className="text-xl font-bold text-green-600">{completedTasks}</div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="border rounded-lg p-4 text-center bg-red-50">
                  <div className="text-xl font-bold text-red-600">{overdueTasks}</div>
                  <div className="text-sm text-red-600">Overdue</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Task Completion Rate</div>
                    <div className="text-xs text-gray-500">
                      {completedTasks} of {userTasks.length} tasks completed
                    </div>
                  </div>
                  <div className="text-sm font-bold">{completionRate}%</div>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="flex justify-center">
                <Button onClick={() => window.location.href = "/tasks"}>
                  View All Tasks
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
