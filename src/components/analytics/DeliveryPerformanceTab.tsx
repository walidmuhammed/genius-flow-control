
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrdersWithDateRange } from '@/hooks/use-orders';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CheckCircle, XCircle, Clock, RotateCcw, TrendingUp } from 'lucide-react';

interface DeliveryPerformanceTabProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const DeliveryPerformanceTab: React.FC<DeliveryPerformanceTabProps> = ({ dateRange }) => {
  const { data: orders = [], isLoading } = useOrdersWithDateRange(
    dateRange.startDate,
    dateRange.endDate
  );

  // Calculate metrics
  const totalOrders = orders.length;
  const successfulOrders = orders.filter(o => o.status === 'Successful').length;
  const failedOrders = orders.filter(o => o.status === 'Unsuccessful').length;
  const returnedOrders = orders.filter(o => o.status === 'Returned').length;
  const successRate = totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(1) : '0';
  const returnRate = totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : '0';

  // Status distribution data
  const statusData = [
    { name: 'New', value: orders.filter(o => o.status === 'New').length, color: '#94A3B8' },
    { name: 'Pending Pickup', value: orders.filter(o => o.status === 'Pending Pickup').length, color: '#F59E0B' },
    { name: 'In Progress', value: orders.filter(o => o.status === 'In Progress').length, color: '#3B82F6' },
    { name: 'Successful', value: orders.filter(o => o.status === 'Successful').length, color: '#10B981' },
    { name: 'Unsuccessful', value: orders.filter(o => o.status === 'Unsuccessful').length, color: '#EF4444' },
    { name: 'Returned', value: orders.filter(o => o.status === 'Returned').length, color: '#8B5CF6' },
  ].filter(item => item.value > 0);

  // Daily orders data
  const dailyOrdersData = React.useMemo(() => {
    const grouped: { [key: string]: number } = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    
    return Object.entries(grouped)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: count
      }))
      .slice(-14); // Last 14 days
  }, [orders]);

  // Courier performance data
  const courierData = React.useMemo(() => {
    const grouped: { [key: string]: { total: number; successful: number } } = {};
    orders.forEach(order => {
      if (order.courier_name) {
        if (!grouped[order.courier_name]) {
          grouped[order.courier_name] = { total: 0, successful: 0 };
        }
        grouped[order.courier_name].total++;
        if (order.status === 'Successful') {
          grouped[order.courier_name].successful++;
        }
      }
    });
    
    return Object.entries(grouped)
      .map(([name, data]) => ({
        courier: name,
        successRate: ((data.successful / data.total) * 100).toFixed(1),
        totalOrders: data.total
      }))
      .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate))
      .slice(0, 5);
  }, [orders]);

  const stats = [
    {
      title: 'Successful Deliveries',
      value: successfulOrders,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Failed Deliveries',
      value: failedOrders,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Return Rate',
      value: `${returnRate}%`,
      icon: RotateCcw,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Orders Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Orders per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#DC291E" 
                    strokeWidth={3}
                    dot={{ fill: '#DC291E', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courier Performance */}
      {courierData.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Courier Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courierData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6B7280" />
                  <YAxis dataKey="courier" type="category" stroke="#6B7280" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any) => [`${value}%`, 'Success Rate']}
                  />
                  <Bar dataKey="successRate" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default DeliveryPerformanceTab;
