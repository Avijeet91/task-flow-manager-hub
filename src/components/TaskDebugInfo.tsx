
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

  // Enhanced task matching checking
  // 1. Direct exact matches
  const tasksWithUserIdExact = tasks.filter(task => task.assignedTo === userId);
  const tasksWithEmployeeIdExact = tasks.filter(task => task.assignedTo === employeeId);
  const tasksWithProfileIdExact = tasks.filter(task => task.assignedTo === profileEmployeeId);
  const tasksWithEmailUsernameExact = tasks.filter(task => task.assignedTo === emailUsername);
  
  // 2. Case insensitive matching
  const tasksWithUserIdCI = tasks.filter(task => 
    task.assignedTo.toLowerCase() === userId.toLowerCase());
  const tasksWithEmployeeIdCI = tasks.filter(task => 
    employeeId && task.assignedTo.toLowerCase() === employeeId.toLowerCase());
  const tasksWithProfileIdCI = tasks.filter(task => 
    profileEmployeeId && task.assignedTo.toLowerCase() === profileEmployeeId.toLowerCase());
  
  // 3. Contains matching (partial matches)
  const tasksWithUserIdContains = tasks.filter(task => 
    task.assignedTo.includes(userId));
  const tasksWithEmployeeIdContains = tasks.filter(task => 
    employeeId && task.assignedTo.includes(employeeId));
  const tasksWithProfileIdContains = tasks.filter(task => 
    profileEmployeeId && task.assignedTo.includes(profileEmployeeId));
  const tasksWithEmailUsernameContains = tasks.filter(task =>
    emailUsername && task.assignedTo.includes(emailUsername));
    
  // 4. Special check for the exact employee IDs in the tasks
  const uniqueAssignedToValues = [...new Set(tasks.map(task => task.assignedTo))];

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
            <strong>Total Tasks in System:</strong> {tasks.length}
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
            <strong>Partial Matches:</strong>
          </div>
          <div>
            <strong>• Tasks with User ID (contains):</strong> {tasksWithUserIdContains.length}
          </div>
          <div>
            <strong>• Tasks with Employee ID (contains):</strong> {tasksWithEmployeeIdContains.length}
          </div>
          <div>
            <strong>• Tasks with Profile ID (contains):</strong> {tasksWithProfileIdContains.length}
          </div>
          <div>
            <strong>• Tasks with Email Username (contains):</strong> {tasksWithEmailUsernameContains.length}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>Unique AssignedTo Values:</strong> {uniqueAssignedToValues.join(', ')}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>All Task IDs with their AssignedTo:</strong>
          </div>
          {tasks.map(task => (
            <div key={task.id}>• {task.id}: {task.assignedTo} ({task.assignedToName})</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDebugInfo;
