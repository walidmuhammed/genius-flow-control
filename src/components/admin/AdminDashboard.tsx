
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users,
  TrendingUp,
  Activity,
  UserPlus,
  Calendar,
  Ticket,
  XCircle,
  DollarSign,
  MapPin,
  Phone,
  Building2
} from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { useTickets } from '@/hooks/use-tickets';
import { usePickups } from '@/hooks/use-pickups';
import { useCustomers } from '@/hooks/use-customers';
import { formatDate } from '@/utils/format';
import { useNavigate } from 'react-router-dom';

type TimeRange = '24h' | '7d' | '30d';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = React.useState<TimeRange>('24h');
  
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets();
  const { data: pickups = [], isLoading: pickupsLoading } = usePickups();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    };
    return ranges[timeRange];
  };

  const startDate = getDateRange();

  // Filter data based on selected time range
  const filteredOrders = orders.filter(order => 
    new Date(order.created_at) >= startDate
  );
  
  const filteredTickets = tickets.filter(ticket => 
    new Date(ticket.created_at) >= startDate
  );
  
  const filteredPickups = pickups.filter(pickup => 
    new Date(pickup.created_at) >= startDate
  );
  
  const filteredCustomers = customers.filter(customer => 
    new Date(customer.created_at) >= startDate
  );

  // Calculate metrics
  const failedOrders = orders.filter(order => 
    order.status === 'Unsuccessful' || order.status === 'Returned'
  );

  const ordersByStatus = {
    new: orders.filter(order => order.status === 'New').length,
    pending: orders.filter(order => order.status === 'Pending Pickup').length,
    inProgress: orders.filter(order => order.status === 'In Progress').length,
    successful: orders.filter(order => order.status === 'Successful').length,
  };

  const openTickets = tickets.filter(ticket => 
    ticket.status === 'New' || ticket.status === 'Processing'
  ).length;

  const statsCards = [
    {
      title: "New Orders",
      value: filteredOrders.length.toString(),
      subtitle: `Last ${timeRange}`,
      icon: Package,
      color: "bg-blue-500",
      onClick: () => navigate('/dashboard/admin/orders')
    },
    {
      title: "New Couriers",
      value: "3", // This would come from a couriers query
      subtitle: `Last ${timeRange}`,
      icon: Truck,
      color: "bg-green-500",
      onClick: () => navigate('/dashboard/admin/couriers')
    },
    {
      title: "New Pickups",
      value: filteredPickups.length.toString(),
      subtitle: `Last ${timeRange}`,
      icon: Calendar,
      color: "bg-orange-500",
      onClick: () => navigate('/dashboard/admin/pickups')
    },
    {
      title: "New Tickets",
      value: filteredTickets.length.toString(),
      subtitle: `Last ${timeRange}`,
      icon: Ticket,
      color: "bg-purple-500",
      onClick: () => navigate('/dashboard/admin/support')
    },
    {
      title: "New Customers",
      value: filteredCustomers.length.toString(),
      subtitle: `Last ${timeRange}`,
      icon: UserPlus,
      color: "bg-cyan-500",
      onClick: () => navigate('/dashboard/admin/customers')
    },
    {
      title: "Failed Events",
      value: failedOrders.length.toString(),
      subtitle: "Requires attention",
      icon: XCircle,
      color: "bg-red-500",
      onClick: () => navigate('/dashboard/admin/orders?status=failed')
    },
  ];

  // Recent activity data
  const recentActivity = [
    ...filteredOrders.slice(0, 3).map(order => ({
      id: order.id,
      type: 'order',
      icon: Package,
      title: `Order ${order.reference_number}`,
      subtitle: `${order.customer.name} - ${order.customer.phone}`,
      time: order.created_at,
      status: order.status
    })),
    ...filteredTickets.slice(0, 2).map(ticket => ({
      id: ticket.id,
      type: 'ticket',
      icon: Ticket,
      title: ticket.title,
      subtitle: `${ticket.category} - ${ticket.status}`,
      time: ticket.created_at,
      status: ticket.status
    })),
    ...filteredPickups.slice(0, 2).map(pickup => ({
      id: pickup.id,
      type: 'pickup',
      icon: Calendar,
      title: `Pickup ${pickup.pickup_id}`,
      subtitle: `${pickup.location} - ${pickup.contact_person}`,
      time: pickup.created_at,
      status: pickup.status
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

  if (ordersLoading || ticketsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            System overview and operational metrics
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <TabsList>
              <TabsTrigger value="24h">24h</TabsTrigger>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat) => (
          <Card 
            key={stat.title} 
            className="border-0 shadow-sm bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow"
            onClick={stat.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-gray-50 text-gray-600 border-gray-200 mt-1"
                  >
                    {stat.subtitle}
                  </Badge>
                </div>
                <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      status === 'new' ? 'bg-blue-500' :
                      status === 'pending' ? 'bg-orange-500' :
                      status === 'inProgress' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="capitalize text-sm font-medium">
                      {status === 'inProgress' ? 'In Progress' : status}
                    </span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <activity.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        activity.status === 'New' ? 'bg-blue-50 text-blue-700' :
                        activity.status === 'Successful' ? 'bg-green-50 text-green-700' :
                        activity.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(new Date(activity.time))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/dashboard/admin/orders')}
              className="flex items-center gap-2 h-12"
            >
              <Package className="h-4 w-4" />
              View All Orders
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/admin/couriers')}
              variant="outline" 
              className="flex items-center gap-2 h-12"
            >
              <Truck className="h-4 w-4" />
              Manage Couriers
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/admin/support')}
              variant="outline" 
              className="flex items-center gap-2 h-12"
            >
              <Ticket className="h-4 w-4" />
              Support Tickets
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/admin/analytics')}
              variant="outline" 
              className="flex items-center gap-2 h-12"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
