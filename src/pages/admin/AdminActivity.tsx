
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Package, User, MessageSquare, Settings } from 'lucide-react';
import { useActivityLogs } from '@/hooks/use-activity';
import { formatDate } from '@/utils/format';

const AdminActivity = () => {
  document.title = "Activity Log - Admin Dashboard";
  
  const { data: activityLogs = [], isLoading } = useActivityLogs();

  const getActivityIcon = (entityType: string, action: string) => {
    switch (entityType) {
      case 'order':
        return <Package className="h-4 w-4" />;
      case 'customer':
        return <User className="h-4 w-4" />;
      case 'ticket':
      case 'ticket_message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'updated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'status_changed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatActivityMessage = (log: any) => {
    const entityName = log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1);
    const action = log.action.replace('_', ' ');
    
    return `${entityName} ${action} by ${log.performed_by}`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Activity Log
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track all system activities and changes
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="h-3 w-3 mr-1" />
            {activityLogs.length} Total Activities
          </Badge>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No activity logs found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 bg-white dark:bg-gray-900 rounded-full border flex items-center justify-center">
                        {getActivityIcon(log.entity_type, log.action)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatActivityMessage(log)}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getActivityColor(log.action)}`}
                        >
                          {log.action.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Entity: {log.entity_type}</span>
                        <span>ID: {log.entity_id.slice(0, 8)}...</span>
                        <span>{formatDate(new Date(log.created_at))}</span>
                      </div>
                      
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border text-xs">
                          <pre className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminActivity;
