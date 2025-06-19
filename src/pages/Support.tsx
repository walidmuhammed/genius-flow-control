
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTickets, useCreateTicket, useAddTicketMessage, useTicketMessages } from '@/hooks/use-tickets';
import { formatDate } from '@/utils/format';
import { Search, Plus, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useScreenSize } from '@/hooks/useScreenSize';

const Support: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketChatOpen, setTicketChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // New ticket form
  const [newTicketForm, setNewTicketForm] = useState({
    category: '',
    title: '',
    content: ''
  });

  const { isMobile } = useScreenSize();
  
  // Fetch tickets and messages
  const { data: tickets = [], isLoading, error } = useTickets();
  const { data: ticketMessages = [] } = useTicketMessages(selectedTicketId || undefined);
  const createTicketMutation = useCreateTicket();
  const addMessageMutation = useAddTicketMessage();

  // Handle URL parameters for global search modal opening
  React.useEffect(() => {
    const modal = searchParams.get('modal');
    const id = searchParams.get('id');
    
    if (modal === 'details' && id && tickets.length > 0) {
      const foundTicket = tickets.find(ticket => ticket.id === id);
      if (foundTicket) {
        setSelectedTicketId(id);
        setTicketChatOpen(true);
        // Clean up URL without adding to history
        navigate('/support', { replace: true });
      } else {
        // Invalid ticket ID, clean up URL
        navigate('/support', { replace: true });
        toast.error('Support ticket not found');
      }
    }
  }, [searchParams, tickets, navigate]);

  // Filter tickets based on status and search
  const filteredTickets = tickets.filter(ticket => {
    const matchesTab = activeTab === 'open' 
      ? ticket.status === 'open' || ticket.status === 'in_progress'
      : ticket.status === 'resolved' || ticket.status === 'closed';
    
    const matchesSearch = !searchQuery || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800"><MessageCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.category || !newTicketForm.title || !newTicketForm.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        category: newTicketForm.category,
        title: newTicketForm.title,
        content: newTicketForm.content
      });
      
      setNewTicketForm({ category: '', title: '', content: '' });
      setNewTicketOpen(false);
      toast.success('Support ticket created successfully');
    } catch (error) {
      toast.error('Failed to create support ticket');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicketId) return;

    try {
      await addMessageMutation.mutateAsync({
        ticket_id: selectedTicketId,
        sender: 'client',
        content: newMessage.trim()
      });
      
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setTicketChatOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#DC291E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading support tickets...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-500 text-sm mt-1">
              Get help and manage your support tickets
            </p>
          </div>
          <Button 
            className="bg-[#DC291E] hover:bg-[#c0211a] text-white"
            onClick={() => setNewTicketOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </motion.div>
        
        {/* Support Tickets Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 bg-gray-50">
                <TabsList className="bg-transparent h-14 w-full justify-start px-6">
                  <TabsTrigger value="open" className="data-[state=active]:border-b-2 data-[state=active]:border-[#DC291E] data-[state=active]:shadow-none rounded-none h-12 px-6">
                    Open Tickets
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="data-[state=active]:border-b-2 data-[state=active]:border-[#DC291E] data-[state=active]:shadow-none rounded-none h-12 px-6">
                    Closed Tickets
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search tickets by title, category, or ticket ID..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              
              <CardContent className="p-0">
                <TabsContent value="open" className="mt-0">
                  {filteredTickets.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No open tickets found</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {filteredTickets.map(ticket => (
                        <div 
                          key={ticket.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleTicketClick(ticket.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#DC291E]">
                                {ticket.ticket_id || `TIC-${ticket.id.slice(-3)}`}
                              </span>
                              {getStatusBadge(ticket.status)}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(new Date(ticket.created_at))}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.content}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {ticket.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Last updated: {formatDate(new Date(ticket.updated_at))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="closed" className="mt-0">
                  {filteredTickets.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No closed tickets found</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {filteredTickets.map(ticket => (
                        <div 
                          key={ticket.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleTicketClick(ticket.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#DC291E]">
                                {ticket.ticket_id || `TIC-${ticket.id.slice(-3)}`}
                              </span>
                              {getStatusBadge(ticket.status)}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(new Date(ticket.created_at))}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.content}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {ticket.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Last updated: {formatDate(new Date(ticket.updated_at))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={newTicketForm.category} onValueChange={(value) => setNewTicketForm({...newTicketForm, category: value})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="pickups">Pickups</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input 
                value={newTicketForm.title}
                onChange={(e) => setNewTicketForm({...newTicketForm, title: e.target.value})}
                placeholder="Brief description of your issue"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <Textarea 
                value={newTicketForm.content}
                onChange={(e) => setNewTicketForm({...newTicketForm, content: e.target.value})}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTicket}
                disabled={createTicketMutation.isPending}
                className="bg-[#DC291E] hover:bg-[#c0211a]"
              >
                {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Chat Dialog */}
      <Dialog open={ticketChatOpen} onOpenChange={setTicketChatOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedTicketId && tickets.find(t => t.id === selectedTicketId)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 max-h-96">
            {ticketMessages.map(message => (
              <div 
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender === 'client' 
                    ? 'bg-[#DC291E] text-white ml-8' 
                    : 'bg-gray-100 text-gray-900 mr-8'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-75">
                  {formatDate(new Date(message.created_at))}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || addMessageMutation.isPending}
              className="bg-[#DC291E] hover:bg-[#c0211a]"
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Support;
