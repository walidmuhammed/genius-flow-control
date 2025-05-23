
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, MapPin, DollarSign, Package, Users } from 'lucide-react';

const AdminSettings = () => {
  document.title = "System Settings - Admin Dashboard";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              System Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure system-wide settings and preferences
            </p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Delivery Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="delivery-fee-usd">Default Delivery Fee (USD)</Label>
                <Input id="delivery-fee-usd" type="number" defaultValue="5.00" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery-fee-lbp">Default Delivery Fee (LBP)</Label>
                <Input id="delivery-fee-lbp" type="number" defaultValue="150000" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-assign orders</Label>
                  <p className="text-sm text-gray-500">Automatically assign new orders to available couriers</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Real-time tracking</Label>
                  <p className="text-sm text-gray-500">Enable live tracking for deliveries</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Zone Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Zone Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max-distance">Maximum delivery distance (km)</Label>
                <Input id="max-distance" type="number" defaultValue="25" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="express-fee">Express delivery surcharge (%)</Label>
                <Input id="express-fee" type="number" defaultValue="50" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Zone-based pricing</Label>
                  <p className="text-sm text-gray-500">Enable different pricing for different zones</p>
                </div>
                <Switch />
              </div>
              
              <Button variant="outline" className="w-full">
                Manage Delivery Zones
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email notifications</Label>
                  <p className="text-sm text-gray-500">Send email updates for critical events</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS notifications</Label>
                  <p className="text-sm text-gray-500">Send SMS updates to customers</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push notifications</Label>
                  <p className="text-sm text-gray-500">Send push notifications to mobile apps</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notification-email">Admin notification email</Label>
                <Input id="notification-email" type="email" defaultValue="admin@topspeed.com" />
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow client registration</Label>
                  <p className="text-sm text-gray-500">Allow new clients to register automatically</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require email verification</Label>
                  <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
              
              <Button variant="outline" className="w-full">
                Manage User Roles
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Save Settings */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button className="bg-[#DC291E] hover:bg-[#DC291E]/90">
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
