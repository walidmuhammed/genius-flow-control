import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CourierPickups = () => {
  document.title = "Pickups - Courier Portal";
  
  return (
    <CourierLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pickups</h1>
          <p className="text-muted-foreground">
            Manage your assigned pickup requests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pickup Assignments</CardTitle>
            <CardDescription>
              View and manage your assigned pickup requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pickup assignments at the moment.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CourierLayout>
  );
};

export default CourierPickups;