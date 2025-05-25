
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Globe, DollarSign, Truck, Mail, Bell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AdminSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoAssignOrders, setAutoAssignOrders] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
          <Button className="bg-[#DC291E] hover:bg-[#DC291E]/90">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="Topspeed Delivery" />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input id="companyEmail" type="email" defaultValue="info@topspeed.com" />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input id="companyPhone" defaultValue="+961 1 234567" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea 
                    id="companyAddress" 
                    defaultValue="123 Main Street, Beirut, Lebanon"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="Asia/Beirut">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Beirut">Beirut (GMT+2)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="primaryCurrency">Primary Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="LBP">Lebanese Pound (LBP)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exchangeRate">USD to LBP Rate</Label>
                <Input id="exchangeRate" type="number" defaultValue="90000" />
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input id="taxRate" type="number" step="0.01" defaultValue="11" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="minOrderValue">Minimum Order Value (USD)</Label>
                <Input id="minOrderValue" type="number" step="0.01" defaultValue="2.00" />
              </div>
              <div>
                <Label htmlFor="maxOrderValue">Maximum Order Value (USD)</Label>
                <Input id="maxOrderValue" type="number" step="0.01" defaultValue="1000.00" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="defaultDeliveryTime">Default Delivery Time (hours)</Label>
                <Input id="defaultDeliveryTime" type="number" defaultValue="24" />
              </div>
              <div>
                <Label htmlFor="maxDeliveryTime">Maximum Delivery Time (hours)</Label>
                <Input id="maxDeliveryTime" type="number" defaultValue="72" />
              </div>
              <div>
                <Label htmlFor="pickupTimeSlots">Pickup Time Slots</Label>
                <Select defaultValue="4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 slots per day</SelectItem>
                    <SelectItem value="4">4 slots per day</SelectItem>
                    <SelectItem value="6">6 slots per day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-assign Orders to Couriers</Label>
                <p className="text-sm text-gray-500">Automatically assign new orders to available couriers</p>
              </div>
              <Switch checked={autoAssignOrders} onCheckedChange={setAutoAssignOrders} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email notifications for important events</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Send SMS notifications for urgent updates</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="adminEmail">Admin Notification Email</Label>
                <Input id="adminEmail" type="email" defaultValue="admin@topspeed.com" />
              </div>
              <div>
                <Label htmlFor="adminPhone">Admin Notification Phone</Label>
                <Input id="adminPhone" defaultValue="+961 70 123456" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              System Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-500">
                  Enable maintenance mode to prevent new orders and display a maintenance message
                </p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            {maintenanceMode && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea 
                    id="maintenanceMessage" 
                    placeholder="Enter the message to display during maintenance..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maintenanceStart">Maintenance Start</Label>
                    <Input id="maintenanceStart" type="datetime-local" />
                  </div>
                  <div>
                    <Label htmlFor="maintenanceEnd">Maintenance End</Label>
                    <Input id="maintenanceEnd" type="datetime-local" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
