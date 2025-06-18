import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Ticket, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTickets, useCreateTicket, useTicketMessages, useAddTicketMessage } from '@/hooks/use-tickets';
import { EmptyState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDate } from '@/utils/format';
import { Ticket as TicketType } from '@/services/tickets';

const Support: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: tickets = [], isLoading } = useTickets();
  const { mutate: createTicket } = useCreateTicket();
  const { mutate: addMessage } = useAddTicketMessage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // New ticket form state
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    content: '',
    category: 'general' as const
  });

  document.title = "Support - Dashboard";

  // Handle URL parameters for modal opening (from global search)
  useEffect(() => {
    const modal = searchParams.get('modal');
    const id = searchParams.get('id');
    
    if (modal === 'details' && id && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        setSelectedTicket(ticket);
        setTicketDetailsOpen(true);
        // Clean up URL params
        navigate('/support', { replace: true });
      } else {
        toast.error('Support ticket not found');
        navigate('/support', { replace: true });
      }
    }
  }, [searchParams, tickets, navigate]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <MessageSquare className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const handleCreateTicket = () => {
    if (!newTicketForm.title.trim() || !newTicketForm.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    createTicket({
      title: newTicketForm.title,
      content: newTicketForm.content,
      category: newTicketForm.category
    }, {
      onSuccess: () => {
        toast.success('Support ticket created successfully');
        setCreateTicketOpen(false);
        setNewTicketForm({ title: '', content: '', category: 'general' });
      }
    });
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;

    addMessage({
      ticket_id: selectedTicket.id,
      content: newMessage.trim(),
      sender: 'client'
    }, {
      onSuccess: () => {
        setNewMessage('');
      }
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Support Tickets
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your support requests and tickets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredTickets.length} Total Tickets
            </Badge>
            <Button 
              className="bg-[#DC291E] hover:bg-[#c0211a] text-white"
              onClick={() => setCreateTicketOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, content, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tickets Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Support Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(ticket.status)}
                              {ticket.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {ticket.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(ticket.created_at))}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setTicketDetailsOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="No support tickets found"
                  description="No tickets match your search criteria."
                  actionLabel="Create Ticket"
                  onAction={() => setCreateTicketOpen(true)}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Ticket Modal */}
        <Dialog open={createTicketOpen} onOpenChange={setCreateTicketOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newTicketForm.category}
                  onValueChange={(value) => setNewTicketForm(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="feature_request">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Please provide detailed information about your issue..."
                  value={newTicketForm.content}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateTicketOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket} className="bg-[#DC291E] hover:bg-[#c0211a]">
                  Create Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ticket Details Modal */}
        <Dialog open={ticketDetailsOpen} onOpenChange={setTicketDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTicket && getStatusIcon(selectedTicket.status)}
                {selectedTicket?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                  <Badge variant="outline">
                    {selectedTicket.category}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {formatDate(new Date(selectedTicket.created_at))}
                  </span>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-700">{selectedTicket.content}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Support;
