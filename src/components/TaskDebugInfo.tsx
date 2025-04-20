
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

  // Get all user identifiers
  const userId = user?.id || 'Not logged in';
  const employeeId = user?.employeeId || 'Not available';
  const profileEmployeeId = profile?.employee_id || 'Not available';
  const emailUsername = user?.email ? user.email.split('@')[0] : 'Not available';

  // Calculate task statistics with more detailed matching
  const tasksWithUserIdExact = tasks.filter(task => task.assignedTo === userId);
  const tasksWithEmployeeIdExact = tasks.filter(task => task.assignedTo === employeeId);
  const tasksWithProfileIdExact = tasks.filter(task => task.assignedTo === profileEmployeeId);
  const tasksWithEmailUsernameExact = tasks.filter(task => task.assignedTo === emailUsername);
  
  // Case insensitive matching checks
  const tasksWithUserIdCI = tasks.filter(task => 
    task.assignedTo.toLowerCase() === userId.toLowerCase());
  const tasksWithEmployeeIdCI = tasks.filter(task => 
    task.assignedTo.toLowerCase() === employeeId.toLowerCase());
  const tasksWithProfileIdCI = tasks.filter(task => 
    task.assignedTo.toLowerCase() === profileEmployeeId.toLowerCase());
  
  // Contains matching (fallback)
  const tasksWithUserIdContains = tasks.filter(task => 
    task.assignedTo.includes(userId));
  const tasksWithEmployeeIdContains = tasks.filter(task => 
    task.assignedTo.includes(employeeId));
  const tasksWithEmailUsernameContains = tasks.filter(task =>
    user?.email && task.assignedTo.includes(user.email.split('@')[0]));

  return (
    <Card className="mb-4 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-sm">Task Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="text-xs font-mono overflow-auto max-h-60">
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
            <strong>Email Username:</strong> {emailUsername}
          </div>
          <div>
            <strong>Total Tasks:</strong> {tasks.length}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>Exact Matches:</strong>
          </div>
          <div>
            <strong>• Tasks with User ID:</strong> {tasksWithUserIdExact.length}
          </div>
          <div>
            <strong>• Tasks with Employee ID:</strong> {tasksWithEmployeeIdExact.length}
          </div>
          <div>
            <strong>• Tasks with Profile Employee ID:</strong> {tasksWithProfileIdExact.length}
          </div>
          <div>
            <strong>• Tasks with Email Username:</strong> {tasksWithEmailUsernameExact.length}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>Case Insensitive Matches:</strong>
          </div>
          <div>
            <strong>• Tasks with User ID (CI):</strong> {tasksWithUserIdCI.length}
          </div>
          <div>
            <strong>• Tasks with Employee ID (CI):</strong> {tasksWithEmployeeIdCI.length}
          </div>
          <div>
            <strong>• Tasks with Profile ID (CI):</strong> {tasksWithProfileIdCI.length}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>All Assigned Task IDs:</strong> {tasks.filter(task => 
              task.assignedTo === userId || 
              task.assignedTo === employeeId || 
              task.assignedTo === profileEmployeeId ||
              task.assignedTo.toLowerCase() === employeeId.toLowerCase() ||
              (user?.email && task.assignedTo.includes(user.email.split('@')[0]))
            ).map(t => t.id).join(', ') || 'None'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDebugInfo;
