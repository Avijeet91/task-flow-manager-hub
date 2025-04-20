
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTask } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TaskDebugInfo = () => {
  const { user, profile, isAdmin } = useAuth();
  const { tasks } = useTask();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Log some debugging information to help diagnose issues
  console.log("Debug - User:", user);
  console.log("Debug - Profile:", profile);
  console.log("Debug - All tasks:", tasks);

  // Calculate task statistics
  const userIdTasks = user ? tasks.filter(task => task.assignedTo === user.id).length : 0;
  const employeeIdTasks = user?.employeeId 
    ? tasks.filter(task => task.assignedTo === user.employeeId).length 
    : 0;
  const profileEmployeeIdTasks = profile?.employee_id 
    ? tasks.filter(task => task.assignedTo === profile.employee_id).length 
    : 0;
  
  // Get all user identifiers
  const userId = user?.id || 'Not logged in';
  const employeeId = user?.employeeId || 'Not available';
  const profileEmployeeId = profile?.employee_id || 'Not available';

  return (
    <Card className="mb-4 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-sm">Task Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="text-xs font-mono overflow-auto max-h-40">
        <div className="space-y-2">
          <div>
            <strong>User ID:</strong> {userId}
          </div>
          <div>
            <strong>User Role:</strong> {user?.role || 'Unknown'}
          </div>
          <div>
            <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User Employee ID:</strong> {employeeId}
          </div>
          <div>
            <strong>Profile Employee ID:</strong> {profileEmployeeId}
          </div>
          <div>
            <strong>Total Tasks:</strong> {tasks.length}
          </div>
          <div>
            <strong>Tasks with User ID as assignedTo:</strong> {userIdTasks}
          </div>
          <div>
            <strong>Tasks with User Employee ID as assignedTo:</strong> {employeeIdTasks}
          </div>
          <div>
            <strong>Tasks with Profile Employee ID as assignedTo:</strong> {profileEmployeeIdTasks}
          </div>
          <div className="pt-2 border-t border-gray-200">
            <strong>Matching Task IDs:</strong> {tasks.filter(task => 
              task.assignedTo === userId || 
              task.assignedTo === employeeId || 
              task.assignedTo === profileEmployeeId
            ).map(t => t.id).join(', ')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDebugInfo;
