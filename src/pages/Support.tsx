
import React, { useState } from 'react';
import { Search, Filter, Clock, Package, ArrowLeft, Package2, Wallet, FileText, Send, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTickets, useTicket, useTicketMessages, useCreateTicket, useAddTicketMessage, useUpdateTicketStatus } from '@/hooks/use-tickets';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TicketCategory } from '@/services/tickets';

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketCategory, setNewTicketCategory] = useState<string>('orders');
  const [newTicketTitle, setNewTicketTitle] = useState<string>('');
  const [newTicketContent, setNewTicketContent] = useState<string>('');
  
  // Fetch tickets
  const { data: tickets = [], isLoading: isLoadingTickets } = useTickets();
  
  // Fetch selected ticket
  const { data: selectedTicket } = useTicket(selectedTicketId || undefined);
  
  // Fetch ticket messages
  const { data: ticketMessages = [] } = useTicketMessages(selectedTicketId || undefined);
  
  // Mutations
  const createTicketMutation = useCreateTicket();
  const addTicketMessageMutation = useAddTicketMessage();
  const updateTicketStatusMutation = useUpdateTicketStatus();

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.includes(searchQuery)
  );

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedTicketId) {
      await addTicketMessageMutation.mutateAsync({
        ticket_id: selectedTicketId,
        sender: 'Customer Service', // This should be the actual user name in a real system
        content: newMessage
      });
      setNewMessage('');
    }
  };

  const handleCreateNewTicket = async () => {
    if (!newTicketTitle.trim()) {
      toast.error('Please enter a ticket title');
      return;
    }
    
    if (!newTicketContent.trim()) {
      toast.error('Please enter ticket details');
      return;
    }
    
    const newTicket = await createTicketMutation.mutateAsync({
      category: getCategoryTitle(newTicketCategory),
      title: newTicketTitle,
      content: newTicketContent
    });
    
    if (newTicket) {
      setIsNewTicketModalOpen(false);
      setNewTicketCategory('orders');
      setNewTicketTitle('');
      setNewTicketContent('');
      setSelectedTicketId(newTicket.id);
    }
  };
  
  const handleCloseTicket = async () => {
    if (selectedTicketId) {
      await updateTicketStatusMutation.mutateAsync({
        ticketId: selectedTicketId,
        status: 'Closed'
      });
      setSelectedTicketId(null);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-blue-500">Open</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'Closed':
        return <Badge variant="outline" className="bg-red-500 text-white">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getCategoryTitle = (categoryKey: string): TicketCategory => {
    switch (categoryKey) {
      case 'orders': return 'Order Issue';
      case 'pickups': return 'Pickup Issue';
      case 'return': return 'Return Issue';
      case 'packaging': return 'Packaging Issue';
      case 'payment': return 'Payment Issue';
      case 'technical': return 'Technical Issue';
      case 'delay': return 'Delay Delivery';
      default: return 'Other';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <MainLayout className="p-0">
      <div className="flex h-full">
        <div className="w-1/3 border-r h-full flex flex-col">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold">Support Tickets</h1>
                <p className="text-sm text-muted-foreground">Contact our support team and to help you anytime and track your tickets.</p>
              </div>
            </div>
            <h2 className="text-lg font-medium mt-4 mb-2">Your Tickets List</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search for ticket..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between mt-4">
              <Button 
                onClick={() => setIsNewTicketModalOpen(true)} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Create New Ticket
              </Button>
            </div>
          </div>
          
          <div className="p-4 text-sm text-muted-foreground">
            Tickets ( {filteredTickets.length} )
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingTickets ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No tickets found. Create a new ticket to get help.</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/40 transition-colors ${
                    selectedTicketId === ticket.id ? 'bg-muted/40' : ''
                  }`}
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  <div className="flex justify-between">
                    <Badge variant="outline" className="bg-muted/80 text-muted-foreground">
                      {ticket.category}
                    </Badge>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="mt-2">
                    <p className="font-medium">Ticket ID {ticket.id.substring(0, 6)}</p>
                    <p className="text-sm text-muted-foreground truncate">{ticket.title}</p>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col h-full">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b flex justify-between items-center">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      Ticket ID {selectedTicket.id.substring(0, 6)}
                    </h2>
                    <p className="text-muted-foreground">{selectedTicket.title}</p>
                    <Badge variant="outline" className="bg-muted/80 text-muted-foreground mt-1">
                      {selectedTicket.category}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleCloseTicket}>
                  {selectedTicket.status === 'Closed' ? 'Reopen' : 'Close'}
                </Button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        C
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg rounded-tl-none max-w-[80%]">
                      <p>{selectedTicket.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(selectedTicket.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {ticketMessages.map((message) => (
                    <div className="flex gap-4" key={message.id}>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {message.sender.charAt(0)}
                        </div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg rounded-tl-none max-w-[80%]">
                        <p>{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Package className="h-5 w-5" />
                  </Button>
                  <Textarea 
                    placeholder="Type your message..." 
                    className="min-h-12 resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={selectedTicket.status === 'Closed'}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    className="flex-shrink-0 bg-primary hover:bg-primary/90" 
                    onClick={handleSendMessage}
                    disabled={selectedTicket.status === 'Closed' || addTicketMessageMutation.isPending || !newMessage.trim()}
                  >
                    {addTicketMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium">No ticket selected</h3>
              <p className="text-muted-foreground mt-2">Select a ticket from the list or create a new one to start a conversation.</p>
              <Button 
                className="mt-4 bg-primary hover:bg-primary/90"
                onClick={() => setIsNewTicketModalOpen(true)}
              >
                Create New Ticket
              </Button>
            </div>
          )}
        </div>

        {/* New Ticket Dialog */}
        <Dialog 
          open={isNewTicketModalOpen}
          onOpenChange={setIsNewTicketModalOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                Tell us which category fits your issue
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Ticket Title</Label>
                <Input 
                  id="title" 
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Details</Label>
                <Textarea 
                  id="content" 
                  value={newTicketContent}
                  onChange={(e) => setNewTicketContent(e.target.value)}
                  placeholder="Provide details about your issue"
                  rows={4}
                />
              </div>
            </div>

            <RadioGroup 
              value={newTicketCategory}
              onValueChange={setNewTicketCategory}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="orders" id="orders" />
                  <div className="flex-1">
                    <Label htmlFor="orders" className="flex items-center">
                      <Package className="h-5 w-5 text-primary mr-2" />
                      <div>
                        <span className="font-medium">Orders</span>
                        <span className="text-muted-foreground ml-2">(Forward or Return)</span>
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground ml-7">Delayed delivery, Damaged order, Missing item...etc</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="pickups" id="pickups" />
                  <div className="flex-1">
                    <Label htmlFor="pickups" className="flex items-center">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">Pickups</span>
                    </Label>
                    <p className="text-sm text-muted-foreground ml-7">Delay pickup, Fake update...etc</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="return" id="return" />
                  <div className="flex-1">
                    <Label htmlFor="return" className="flex items-center">
                      <ArrowLeft className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">Return</span>
                    </Label>
                    <p className="text-sm text-muted-foreground ml-7">Delay pickup, Fake update...etc</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="packaging" id="packaging" />
                  <div className="flex-1">
                    <Label htmlFor="packaging" className="flex items-center">
                      <Package2 className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">Materials and Packing</span>
                    </Label>
                    <p className="text-sm text-muted-foreground ml-7">Issues you are facing with our packaging materials</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="payment" id="payment" />
                  <div className="flex-1">
                    <Label htmlFor="payment" className="flex items-center">
                      <Wallet className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">Payment and Wallet</span>
                    </Label>
                    <p className="text-sm text-muted-foreground ml-7">Issues you face with your payments or financial issues</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="others" id="others" />
                  <div className="flex-1">
                    <Label htmlFor="others" className="flex items-center">
                      <FileText className="h-5 w-5 text-primary mr-2" />
                      <span className="font-medium">Others</span>
                    </Label>
                    <p className="text-sm text-muted-foreground ml-7">Any other issues you are facing</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsNewTicketModalOpen(false);
                  setNewTicketTitle('');
                  setNewTicketContent('');
                  setNewTicketCategory('orders');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateNewTicket}
                className="bg-primary hover:bg-primary/90"
                disabled={createTicketMutation.isPending || !newTicketTitle.trim() || !newTicketContent.trim()}
              >
                {createTicketMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Support;
