import React from 'react';
import CourierLayout from '@/components/courier/CourierLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CourierSettings = () => {
  document.title = "Settings - Courier Portal";
  
  return (
    <CourierLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Update your profile and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Settings panel coming soon.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CourierLayout>
  );
};

export default CourierSettings;