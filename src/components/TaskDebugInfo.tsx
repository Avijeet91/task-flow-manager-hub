
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTask } from '@/context/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TaskDebugInfo = () => {
  const { user, profile, isAdmin } = useAuth();
  const { tasks, getUserTasks } = useTask();

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Get all user identifiers
  const userId = user?.id || 'Not logged in';
  const employeeId = user?.employeeId || 'Not available';
  const profileEmployeeId = profile?.employee_id || 'Not available';
  const email = user?.email || 'Not available';
  const emailUsername = user?.email ? user.email.split('@')[0] : 'Not available';

  // Get user tasks to check if they're showing up correctly
  const userTasksList = getUserTasks();
  
  // Get all available assignedTo values
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
            <strong>Employee ID:</strong> {employeeId}
          </div>
          <div>
            <strong>Profile Employee ID:</strong> {profileEmployeeId}
          </div>
          <div>
            <strong>Email:</strong> {email}
          </div>
          <div>
            <strong>Email Username:</strong> {emailUsername}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>Total Tasks in System:</strong> {tasks.length}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>Tasks Assigned to Current User:</strong> {userTasksList.length}
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>Unique AssignedTo Values:</strong> 
            <div className="pl-2">
              {uniqueAssignedToValues.map((value, index) => (
                <div key={index}>{value || '(empty)'}</div>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <strong>All Tasks:</strong>
          </div>
          {tasks.map(task => (
            <div key={task.id} className="pl-2 border-l-2 border-gray-300 mb-2">
              <div><strong>ID:</strong> {task.id}</div>
              <div><strong>Title:</strong> {task.title}</div>
              <div><strong>AssignedTo:</strong> "{task.assignedTo}"</div>
              <div><strong>AssignedToName:</strong> {task.assignedToName}</div>
              <div><strong>Status:</strong> {task.status}</div>
              <div className="text-red-500"><strong>Would match current user:</strong> {
                userTasksList.some(t => t.id === task.id) ? 'YES' : 'NO'
              }</div>
              <div className="text-blue-500"><strong>Match details:</strong></div>
              <div className="pl-2">
                <div>- Employee ID match: {task.assignedTo === employeeId ? 'YES' : 'NO'}</div>
                <div>- Profile employee ID match: {task.assignedTo === profileEmployeeId ? 'YES' : 'NO'}</div>
                <div>- Email match: {task.assignedTo === email ? 'YES' : 'NO'}</div>
                <div>- Email username in assignedTo: {emailUsername !== 'Not available' && task.assignedTo.includes(emailUsername) ? 'YES' : 'NO'}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDebugInfo;
