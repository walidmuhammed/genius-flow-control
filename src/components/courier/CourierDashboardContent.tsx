import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Clock,
  TrendingUp,
  User,
  Star,
  Phone,
  Car
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const CourierDashboardContent = () => {
  const { profile } = useAuth();

  // Mock data - in real app this would come from hooks
  const kpis = {
    ordersToday: 12,
    ordersInProgress: 3,
    ordersSuccessful: 8,
    ordersUnsuccessful: 1,
    earningsUSD: 45.50,
    earningsLBP: 680000,
    pendingPayouts: 125.75
  };

  const orderStatuses = [
    { status: 'In Progress', count: 3, color: 'bg-blue-500' },
    { status: 'Successful', count: 8, color: 'bg-green-500' },
    { status: 'Unsuccessful', count: 1, color: 'bg-red-500' },
    { status: 'New', count: 2, color: 'bg-yellow-500' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Ahmad Hassan', pickup: 'Beirut', dropoff: 'Jounieh', status: 'In Progress', amount: '$12.50' },
    { id: 'ORD-002', customer: 'Sara Khalil', pickup: 'Tripoli', dropoff: 'Beirut', status: 'Successful', amount: '$18.00' },
    { id: 'ORD-003', customer: 'Mahmoud Ali', pickup: 'Sidon', dropoff: 'Tyre', status: 'Successful', amount: '$15.75' },
    { id: 'ORD-004', customer: 'Layla Nasser', pickup: 'Beirut', dropoff: 'Baabda', status: 'New', amount: '$8.25' },
    { id: 'ORD-005', customer: 'Omar Farid', pickup: 'Zahle', dropoff: 'Beirut', status: 'Successful', amount: '$22.00' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'In Progress': 'bg-blue-100 text-blue-800',
      'Successful': 'bg-green-100 text-green-800',
      'Unsuccessful': 'bg-red-100 text-red-800',
      'New': 'bg-yellow-100 text-yellow-800'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.full_name || 'Courier'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's your delivery overview for today
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Active
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.ordersToday}</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.ordersInProgress}</div>
            <p className="text-xs text-muted-foreground">
              Active deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.ordersSuccessful}</div>
            <p className="text-xs text-muted-foreground">
              Completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.earningsUSD}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.earningsLBP.toLocaleString()} LBP
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderStatuses.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{item.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / 14) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Courier Profile Quick View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{profile?.full_name || 'Courier Name'}</h3>
                  <p className="text-sm text-gray-500">ID: {profile?.id?.slice(-6).toUpperCase() || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{profile?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-400" />
                  <span>Motorcycle</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.8 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Route</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 text-sm font-medium">{order.id}</td>
                    <td className="py-3 text-sm">{order.customer}</td>
                    <td className="py-3 text-sm">{order.pickup} → {order.dropoff}</td>
                    <td className="py-3">
                      <Badge className={`text-xs ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm font-medium">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline">View All Orders</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourierDashboardContent;