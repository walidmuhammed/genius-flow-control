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
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
  Eye
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

  // Calculate metrics
  const failedOrders = orders.filter(order => 
    order.status === 'Unsuccessful' || order.status === 'Returned'
  );

  const successfulOrders = orders.filter(order => order.status === 'Successful');
  const totalRevenue = successfulOrders.reduce((sum, order) => {
    return sum + (order.delivery_fees_usd || 0);
  }, 0);

  const openTickets = tickets.filter(ticket => 
    ticket.status === 'New' || ticket.status === 'Processing'
  ).length;

  const unassignedPickups = pickups.filter(pickup => 
    pickup.status === 'Scheduled' && !pickup.courier_name
  ).length;

  // Calculate trend (mock data for now - would be calculated from historical data)
  const getTrend = (current: number) => {
    const previous = Math.floor(current * (0.8 + Math.random() * 0.4)); // Mock previous period
    const change = ((current - previous) / (previous || 1)) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      positive: change >= 0,
      percentage: change
    };
  };

  const kpiMetrics = [
    {
      title: "Orders",
      value: filteredOrders.length.toString(),
      trend: getTrend(filteredOrders.length),
      icon: Package,
      onClick: () => navigate('/dashboard/admin/orders')
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toFixed(0)}`,
      trend: getTrend(totalRevenue),
      icon: DollarSign,
      onClick: () => navigate('/dashboard/admin/wallet')
    },
    {
      title: "Pickups",
      value: filteredPickups.length.toString(),
      trend: getTrend(filteredPickups.length),
      icon: Calendar,
      onClick: () => navigate('/dashboard/admin/pickups')
    },
    {
      title: "Support",
      value: openTickets.toString(),
      trend: getTrend(openTickets),
      icon: Ticket,
      alert: openTickets > 5,
      onClick: () => navigate('/dashboard/admin/support')
    },
    {
      title: "Failed",
      value: failedOrders.length.toString(),
      trend: getTrend(failedOrders.length),
      icon: AlertCircle,
      alert: failedOrders.length > 0,
      onClick: () => navigate('/dashboard/admin/orders?status=failed')
    }
  ];

  // Recent activity feed
  const recentActivity = [
    ...filteredOrders.slice(0, 5).map(order => ({
      id: order.id,
      type: 'order' as const,
      icon: Package,
      title: `Order Created by ${order.customer?.name || 'Unknown'}`,
      subtitle: `${order.reference_number} - ${order.customer?.phone || 'No phone'}`,
      time: order.created_at,
      link: `/dashboard/admin/orders`,
      status: order.status
    })),
    ...filteredTickets.slice(0, 3).map(ticket => ({
      id: ticket.id,
      type: 'ticket' as const,
      icon: Ticket,
      title: `Support Ticket Created`,
      subtitle: `${ticket.title} - ${ticket.category}`,
      time: ticket.created_at,
      link: `/dashboard/admin/support`,
      status: ticket.status
    })),
    ...filteredPickups.slice(0, 3).map(pickup => ({
      id: pickup.id,
      type: 'pickup' as const,
      icon: Calendar,
      title: `Pickup Scheduled`,
      subtitle: `${pickup.location} - ${pickup.contact_person}`,
      time: pickup.created_at,
      link: `/dashboard/admin/pickups`,
      status: pickup.status
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  // Attention needed items
  const attentionItems = [
    ...(unassignedPickups > 0 ? [{
      title: `${unassignedPickups} Unassigned Pickups`,
      description: 'Pickups waiting for courier assignment',
      action: 'Assign Now',
      link: '/dashboard/admin/pickups',
      type: 'warning' as const,
      icon: Calendar
    }] : []),
    ...(failedOrders.length > 0 ? [{
      title: `${failedOrders.length} Failed Deliveries`,
      description: 'Orders that need review and resolution',
      action: 'Review',
      link: '/dashboard/admin/orders?status=failed',
      type: 'error' as const,
      icon: XCircle
    }] : []),
    ...(openTickets > 5 ? [{
      title: `${openTickets} Open Tickets`,
      description: 'High volume of support requests',
      action: 'View Tickets',
      link: '/dashboard/admin/support',
      type: 'warning' as const,
      icon: Ticket
    }] : [])
  ];

  // Top performers (mock data)
  const highlights = [
    {
      title: 'Top Courier Today',
      value: 'Ahmed K.',
      metric: '12 deliveries',
      icon: Star
    },
    {
      title: 'Highest Revenue Store',
      value: 'GlamLux',
      metric: '$480 today',
      icon: TrendingUp
    },
    {
      title: 'Fastest Delivery',
      value: '18 min',
      metric: 'Beirut Central',
      icon: Zap
    },
    {
      title: 'New Clients',
      value: '3',
      metric: 'This week',
      icon: Building2
    }
  ];

  if (ordersLoading || ticketsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
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
            Command Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live operations across all clients and regions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={timeRange} onValueChange={(value: string) => setTimeRange(value as TimeRange)}>
            <TabsList>
              <TabsTrigger value="24h">Today</TabsTrigger>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
            <Activity className="h-3 w-3 mr-1" />
            System Online
          </Badge>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiMetrics.map((metric) => (
          <Card 
            key={metric.title} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              metric.alert ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 
              'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}
            onClick={metric.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <metric.icon className={`h-4 w-4 ${
                      metric.alert ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <p className={`text-xs font-medium ${
                      metric.alert ? 'text-red-700' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {metric.title}
                    </p>
                  </div>
                  <p className={`text-xl font-bold mt-1 ${
                    metric.alert ? 'text-red-900 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend.positive ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${
                      metric.trend.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend.value}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div 
                  key={`${activity.type}-${activity.id}`} 
                  className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => navigate(activity.link)}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <activity.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">
                      {new Date(activity.time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <Eye className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attention Needed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attentionItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All systems running smoothly
                </p>
              </div>
            ) : (
              attentionItems.map((item, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    item.type === 'error' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <item.icon className={`h-4 w-4 mt-0.5 ${
                      item.type === 'error' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        item.type === 'error' ? 'text-red-900' : 'text-orange-900'
                      } dark:text-gray-100`}>
                        {item.title}
                      </p>
                      <p className={`text-xs mt-1 ${
                        item.type === 'error' ? 'text-red-700' : 'text-orange-700'
                      } dark:text-gray-300`}>
                        {item.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs"
                        onClick={() => navigate(item.link)}
                      >
                        {item.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Today's Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <highlight.icon className="h-6 w-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">{highlight.value}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{highlight.title}</p>
                <p className="text-xs text-gray-500 mt-1">{highlight.metric}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/dashboard/admin/orders')}
              className="flex items-center gap-2 h-12"
            >
              <Package className="h-4 w-4" />
              View Orders
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
              Support Center
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