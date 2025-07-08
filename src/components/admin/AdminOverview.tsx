
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  XCircle
} from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { useTickets } from '@/hooks/use-tickets';
import { usePickups } from '@/hooks/use-pickups';
import { useCustomers } from '@/hooks/use-customers';
import { formatDate } from '@/utils/format';

const AdminOverview = () => {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets();
  const { data: pickups = [], isLoading: pickupsLoading } = usePickups();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();

  // Calculate real-time metrics from all data
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // New items today
  const newOrdersToday = orders.filter(order => 
    new Date(order.created_at) >= todayStart
  );
  
  const newTicketsToday = tickets.filter(ticket => 
    new Date(ticket.created_at) >= todayStart
  );
  
  const newPickupsToday = pickups.filter(pickup => 
    new Date(pickup.created_at) >= todayStart
  );
  
  const newCustomersToday = customers.filter(customer => 
    new Date(customer.created_at) >= todayStart
  );

  // Failed events
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
      value: newOrdersToday.length.toString(),
      subtitle: "Today",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "New Couriers",
      value: "3", // This would come from a couriers query
      subtitle: "This week",
      icon: Truck,
      color: "bg-green-500",
    },
    {
      title: "New Pickups",
      value: newPickupsToday.length.toString(),
      subtitle: "Today",
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      title: "New Tickets",
      value: newTicketsToday.length.toString(),
      subtitle: "Today",
      icon: Ticket,
      color: "bg-purple-500",
    },
    {
      title: "New Customers",
      value: newCustomersToday.length.toString(),
      subtitle: "Today",
      icon: UserPlus,
      color: "bg-cyan-500",
    },
    {
      title: "Failed Events",
      value: failedOrders.length.toString(),
      subtitle: "Requires attention",
      icon: XCircle,
      color: "bg-red-500",
    },
  ];

  if (ordersLoading || ticketsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            System overview and operational metrics
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Activity className="h-3 w-3 mr-1" />
          System Online
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                    >
                      {stat.subtitle}
                    </Badge>
                  </div>
                </div>
                <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <span className="font-medium">Order {order.reference_number}</span>
                    <span className="text-gray-500 ml-2">
                      {order.customer.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {formatDate(new Date(order.created_at))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
