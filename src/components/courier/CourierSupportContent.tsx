import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Package,
  DollarSign,
  User,
  Settings,
  HelpCircle
} from 'lucide-react';

const CourierSupportContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock data - in real app this would come from hooks
  const tickets = [
    {
      id: 'TIC-001',
      title: 'Payment not received for last week',
      category: 'Payment / Payout Related',
      status: 'Open',
      priority: 'High',
      createdAt: '2024-01-15 10:30',
      lastReply: '2024-01-15 14:45',
      description: 'I have not received my payout for the deliveries completed last week. The admin portal shows it as processed but I have not received it in my account.',
      messagesCount: 3,
      relatedOrder: 'Multiple orders'
    },
    {
      id: 'TIC-002',
      title: 'Customer refused to pay cash collection',
      category: 'Order Related',
      status: 'Pending',
      priority: 'Medium',
      createdAt: '2024-01-14 16:20',
      lastReply: '2024-01-14 18:30',
      description: 'Order ORD-125 - Customer refused to pay the cash collection amount. Need guidance on how to proceed.',
      messagesCount: 5,
      relatedOrder: 'ORD-125'
    },
    {
      id: 'TIC-003',
      title: 'Cannot update delivery status in app',
      category: 'Technical Issue',
      status: 'Resolved',
      priority: 'Low',
      createdAt: '2024-01-13 09:15',
      lastReply: '2024-01-13 11:30',
      description: 'The mobile app is not allowing me to mark orders as delivered. The button is grayed out.',
      messagesCount: 2,
      relatedOrder: 'N/A'
    }
  ];

  const statusCounts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    pending: tickets.filter(t => t.status === 'Pending').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  const categories = [
    { id: 'order', label: 'Order Related', icon: Package, color: 'bg-blue-100 text-blue-800' },
    { id: 'payment', label: 'Payment / Payout Related', icon: DollarSign, color: 'bg-green-100 text-green-800' },
    { id: 'account', label: 'Account / Profile', icon: User, color: 'bg-purple-100 text-purple-800' },
    { id: 'technical', label: 'Technical Issue', icon: Settings, color: 'bg-red-100 text-red-800' },
    { id: 'other', label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-800' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Open': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-gray-100 text-gray-800'
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-blue-100 text-blue-800'
    };
    return priorityConfig[priority as keyof typeof priorityConfig] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === 'all' || 
                      ticket.status.toLowerCase() === selectedTab.toLowerCase();
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Get help with your deliveries and account
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Quick Help Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md"
              >
                <category.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-center">{category.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tickets by title, ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open ({statusCounts.open})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({statusCounts.pending})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({statusCounts.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {/* Tickets List */}
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        {getStatusIcon(ticket.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {ticket.title}
                            </h3>
                            <Badge className={`text-xs ${getStatusBadge(ticket.status)}`}>
                              {ticket.status}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityBadge(ticket.priority)}`}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{ticket.id} • {ticket.category}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>Created: {ticket.createdAt}</span>
                          <span>Last reply: {ticket.lastReply}</span>
                          {ticket.relatedOrder !== 'N/A' && (
                            <span>Order: {ticket.relatedOrder}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.messagesCount} messages</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex-shrink-0">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTickets.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No tickets found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No tickets match the selected filter.'}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourierSupportContent;