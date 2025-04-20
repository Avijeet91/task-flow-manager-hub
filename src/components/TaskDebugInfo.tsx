
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

  return (
    <Card className="mb-4 bg-slate-50">
      <CardHeader>
        <CardTitle className="text-sm">Task Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="text-xs font-mono overflow-auto max-h-40">
        <div className="space-y-2">
          <div>
            <strong>User ID:</strong> {user?.id || 'Not logged in'}
          </div>
          <div>
            <strong>User Role:</strong> {user?.role || 'Unknown'}
          </div>
          <div>
            <strong>Employee ID:</strong> {user?.employeeId || profile?.employee_id || 'Not available'}
          </div>
          <div>
            <strong>Total Tasks:</strong> {tasks.length}
          </div>
          <div>
            <strong>Tasks with this user ID as assignedTo:</strong> {
              tasks.filter(task => task.assignedTo === user?.id).length
            }
          </div>
          <div>
            <strong>Tasks with this employee ID as assignedTo:</strong> {
              tasks.filter(task => task.assignedTo === (user?.employeeId || profile?.employee_id)).length
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDebugInfo;
