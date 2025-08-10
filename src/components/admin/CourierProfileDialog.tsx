
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  Package, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { CourierWithStats } from '@/services/couriers';
import { useCourierOrders, useCourierPickups } from '@/hooks/use-couriers';
import { format } from 'date-fns';

interface CourierProfileDialogProps {
  courier: CourierWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CourierProfileDialog = ({ courier, open, onOpenChange }: CourierProfileDialogProps) => {
  const { data: orders = [] } = useCourierOrders(courier?.id);
  const { data: pickups = [] } = useCourierPickups(courier?.full_name);

  if (!courier) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'Successful':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Successful</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'Unsuccessful':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Unsuccessful</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={courier.avatar_url} />
              <AvatarFallback>
                {courier.full_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{courier.full_name}</div>
              <div className="text-sm text-muted-foreground">Courier ID: {courier.id.slice(0, 8)}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger 
              value="info"
              className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white"
            >
              Courier Info
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white"
            >
              Orders
            </TabsTrigger>
            <TabsTrigger 
              value="pickups"
              className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white"
            >
              Pickups
            </TabsTrigger>
            <TabsTrigger 
              value="finances"
              className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white"
            >
              Finances
            </TabsTrigger>
            <TabsTrigger 
              value="account"
              className="data-[state=active]:bg-[#DB271E] data-[state=active]:text-white"
            >
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={courier.full_name} readOnly />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={courier.phone || 'Not provided'} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={courier.email || 'Not provided'} readOnly />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input value={courier.address || 'Not provided'} readOnly />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(courier.status || 'active')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Vehicle Type</Label>
                    <Input value={courier.vehicle_type || 'Motorcycle'} readOnly />
                  </div>
                  <div>
                    <Label>Assigned Zones</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {courier.assigned_zones?.length ? 
                        courier.assigned_zones.map((zone, index) => (
                          <Badge key={index} variant="outline">{zone}</Badge>
                        )) :
                        <span className="text-sm text-muted-foreground">No zones assigned</span>
                      }
                    </div>
                  </div>
                  <div>
                    <Label>Rating</Label>
                    <div className="text-lg font-medium">⭐ {courier.rating || 'N/A'}</div>
                  </div>
                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea 
                      value={courier.admin_notes || ''} 
                      placeholder="Add notes about this courier..."
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Previews */}
            {(courier.id_photo_url || courier.license_photo_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courier.id_photo_url && (
                      <div className="space-y-2">
                        <Label>ID Photo</Label>
                        <div className="border rounded-lg p-2">
                          <img 
                            src={courier.id_photo_url} 
                            alt="ID Photo" 
                            className="w-full h-40 object-cover rounded"
                          />
                          <Button variant="outline" size="sm" className="mt-2 w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    )}
                    {courier.license_photo_url && (
                      <div className="space-y-2">
                        <Label>Driver License</Label>
                        <div className="border rounded-lg p-2">
                          <img 
                            src={courier.license_photo_url} 
                            alt="License Photo" 
                            className="w-full h-40 object-cover rounded"
                          />
                          <Button variant="outline" size="sm" className="mt-2 w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{courier.active_orders_count}</div>
                    <div className="text-sm text-muted-foreground">Active Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{courier.orders_completed_today}</div>
                    <div className="text-sm text-muted-foreground">Orders Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{courier.pickups_completed_today}</div>
                    <div className="text-sm text-muted-foreground">Pickups Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ${courier.cash_on_hand_usd.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Cash on Hand</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Orders Handled ({orders.length})</h3>
                <p className="text-sm text-muted-foreground">Manage and assign orders to this courier</p>
              </div>
              <Button 
                style={{ backgroundColor: '#DB271E', color: 'white' }}
                className="hover:bg-[#B91C1C]"
              >
                <Package className="h-4 w-4 mr-2" />
                Assign Orders
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>COD Amount</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 10).map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.order_id}</TableCell>
                        <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                        <TableCell>{order.customer?.cities?.name || 'N/A'}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.cash_collection_enabled ? 
                            `$${(order.cash_collection_usd || 0).toFixed(2)}` : 
                            'No COD'
                          }
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {orders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found for this courier
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pickups" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Pickups Handled ({pickups.length})</h3>
                <p className="text-sm text-muted-foreground">Manage and assign pickups to this courier</p>
              </div>
              <Button 
                style={{ backgroundColor: '#DB271E', color: 'white' }}
                className="hover:bg-[#B91C1C]"
              >
                <Truck className="h-4 w-4 mr-2" />
                Assign Pickups
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Recent Pickups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pickup ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Orders Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickups.slice(0, 10).map((pickup: any) => (
                      <TableRow key={pickup.id}>
                        <TableCell className="font-medium">{pickup.pickup_id}</TableCell>
                        <TableCell>{pickup.location}</TableCell>
                        <TableCell>{pickup.orders_count || 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{pickup.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(pickup.pickup_date), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {pickups.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pickups found for this courier
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finances" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cash Collection Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cash on Hand (USD):</span>
                    <span className="font-bold text-green-600">
                      ${courier.cash_on_hand_usd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cash on Hand (LBP):</span>
                    <span className="font-bold text-green-600">
                      {courier.cash_on_hand_lbp.toLocaleString()} LBP
                    </span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Reconcile Cash
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Delivery Fees Earned
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Earned (USD):</span>
                    <span className="font-bold text-blue-600">
                      ${courier.delivery_fees_usd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Earned (LBP):</span>
                    <span className="font-bold text-blue-600">
                      {courier.delivery_fees_lbp.toLocaleString()} LBP
                    </span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Payout
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Financial Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Financial Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>COD Collected</TableHead>
                      <TableHead>Delivery Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders
                      .filter((order: any) => order.status === 'Successful')
                      .slice(0, 5)
                      .map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.order_id}</TableCell>
                          <TableCell>
                            {order.cash_collection_enabled ? 
                              `$${(order.cash_collection_usd || 0).toFixed(2)}` : 
                              'No COD'
                            }
                          </TableCell>
                          <TableCell>
                            ${(order.delivery_fees_usd || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email" 
                      value={courier.email || ''} 
                      placeholder="Enter email address"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This email will be used for account login and notifications
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword"
                        type="password" 
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password" 
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Last login: Never
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline">
                        Reset Password
                      </Button>
                      <Button 
                        style={{ backgroundColor: '#DB271E', color: 'white' }}
                        className="hover:bg-[#B91C1C]"
                      >
                        Update Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Account Status:</span>
                    {getStatusBadge(courier.status || 'active')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Verified:</span>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(courier.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CourierProfileDialog;
