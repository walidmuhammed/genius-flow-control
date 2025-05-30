
import React, { useState } from 'react';
import { Search, Filter, Clock, Package, ArrowLeft, Package2, Wallet, FileText, Send, Loader2, Ticket } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTickets, useTicket, useTicketMessages, useCreateTicket, useAddTicketMessage, useUpdateTicketStatus } from '@/hooks/use-tickets';
import { useOrders } from '@/hooks/use-orders';
import { usePickups } from '@/hooks/use-pickups';
import { useInvoices } from '@/hooks/use-invoices';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TicketCategory } from '@/services/tickets';

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [newTicketCategory, setNewTicketCategory] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedPickupId, setSelectedPickupId] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [showOtherField, setShowOtherField] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>('');
  
  // Fetch tickets
  const { data: tickets = [], isLoading: isLoadingTickets } = useTickets();
  
  // Fetch data for dropdowns
  const { data: orders = [] } = useOrders();
  const { data: pickups = [] } = usePickups();
  const { data: invoices = [] } = useInvoices();
  
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

  // Issue options for different categories
  const orderIssues = [
    'Delayed delivery',
    'Missing item',
    'Damaged order',
    'Wrong delivery address',
    'Order not delivered'
  ];

  const pickupIssues = [
    'Delayed pickup',
    'Pickup not completed',
    'Wrong pickup address',
    'Items not collected',
    'Courier issues'
  ];

  const walletIssues = [
    'Payment not received',
    'Invoice discrepancy',
    'Missing transaction',
    'Incorrect amounts',
    'Payment delays'
  ];

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedTicketId) {
      await addTicketMessageMutation.mutateAsync({
        ticket_id: selectedTicketId,
        sender: 'Customer Service',
        content: newMessage
      });
      setNewMessage('');
    }
  };

  const handleCategorySelect = (category: string) => {
    setNewTicketCategory(category);
    setCurrentStep(2);
  };

  const handleCreateNewTicket = async () => {
    let ticketTitle = '';
    let ticketContent = '';
    
    // Generate title and content based on category and selections
    switch (newTicketCategory) {
      case 'orders':
        if (showOtherField) {
          if (!customMessage.trim()) {
            toast.error('Please describe your issue');
            return;
          }
          ticketTitle = 'Order Issue - Other';
          ticketContent = customMessage;
        } else {
          if (!selectedOrderId || !selectedIssue) {
            toast.error('Please select an order and issue type');
            return;
          }
          const selectedOrder = orders.find(o => o.id === selectedOrderId);
          ticketTitle = `Order Issue - ${selectedIssue}`;
          ticketContent = `Issue with order ${selectedOrder?.reference_number}: ${selectedIssue}`;
        }
        break;
        
      case 'pickups':
        if (showOtherField) {
          if (!customMessage.trim()) {
            toast.error('Please describe your issue');
            return;
          }
          ticketTitle = 'Pickup Issue - Other';
          ticketContent = customMessage;
        } else {
          if (!selectedPickupId || !selectedIssue) {
            toast.error('Please select a pickup and issue type');
            return;
          }
          const selectedPickup = pickups.find(p => p.id === selectedPickupId);
          ticketTitle = `Pickup Issue - ${selectedIssue}`;
          ticketContent = `Issue with pickup ${selectedPickup?.pickup_id}: ${selectedIssue}`;
        }
        break;
        
      case 'payment':
        if (showOtherField) {
          if (!customMessage.trim()) {
            toast.error('Please describe your issue');
            return;
          }
          ticketTitle = 'Payment Issue - Other';
          ticketContent = customMessage;
        } else {
          if (!selectedInvoiceId || !selectedIssue) {
            toast.error('Please select an invoice and issue type');
            return;
          }
          const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);
          ticketTitle = `Payment Issue - ${selectedIssue}`;
          ticketContent = `Issue with invoice ${selectedInvoice?.invoice_id}: ${selectedIssue}`;
        }
        break;
        
      case 'others':
        if (!customMessage.trim()) {
          toast.error('Please describe your issue');
          return;
        }
        ticketTitle = 'General Issue';
        ticketContent = customMessage;
        break;
    }
    
    const newTicket = await createTicketMutation.mutateAsync({
      category: getCategoryTitle(newTicketCategory),
      title: ticketTitle,
      content: ticketContent
    });
    
    if (newTicket) {
      setIsNewTicketModalOpen(false);
      resetForm();
      setSelectedTicketId(newTicket.id);
    }
  };
  
  const resetForm = () => {
    setCurrentStep(1);
    setNewTicketCategory('');
    setSelectedOrderId('');
    setSelectedPickupId('');
    setSelectedInvoiceId('');
    setSelectedIssue('');
    setShowOtherField(false);
    setCustomMessage('');
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

  const goBackToStep1 = () => {
    setCurrentStep(1);
    setNewTicketCategory('');
    setSelectedOrderId('');
    setSelectedPickupId('');
    setSelectedInvoiceId('');
    setSelectedIssue('');
    setShowOtherField(false);
    setCustomMessage('');
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <DialogDescription>
        Tell us which category fits your issue
      </DialogDescription>
      
      <div className="space-y-3">
        <div 
          className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
          onClick={() => handleCategorySelect('orders')}
        >
          <Package className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Orders</div>
            <div className="text-sm text-muted-foreground">(Forward or Return)</div>
            <p className="text-sm text-muted-foreground mt-1">Delayed delivery, Damaged order, Missing item...etc</p>
          </div>
        </div>
        
        <div 
          className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
          onClick={() => handleCategorySelect('pickups')}
        >
          <Clock className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Pickups</div>
            <p className="text-sm text-muted-foreground mt-1">Delay pickup, Fake update...etc</p>
          </div>
        </div>
        
        <div 
          className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
          onClick={() => handleCategorySelect('payment')}
        >
          <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Payment and Wallet</div>
            <p className="text-sm text-muted-foreground mt-1">Issues you face with your payments or financial issues</p>
          </div>
        </div>
        
        <div 
          className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
          onClick={() => handleCategorySelect('others')}
        >
          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Others</div>
            <p className="text-sm text-muted-foreground mt-1">Any other issues you are facing</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    switch (newTicketCategory) {
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={goBackToStep1}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-medium">Order Issue</h3>
                <p className="text-sm text-muted-foreground">Select your order and describe the issue</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order">Select Order</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an order..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.reference_number} - {order.customer?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Type</Label>
                <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's the issue?" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderIssues.map((issue) => (
                      <SelectItem key={issue} value={issue}>
                        {issue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowOtherField(!showOtherField)}
                className="w-full"
                type="button"
              >
                Other
              </Button>
              
              {showOtherField && (
                <div className="space-y-2">
                  <Label htmlFor="custom-message">Describe your issue</Label>
                  <Textarea 
                    id="custom-message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      case 'pickups':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={goBackToStep1}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-medium">Pickup Issue</h3>
                <p className="text-sm text-muted-foreground">Select your pickup and describe the issue</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Select Pickup</Label>
                <Select value={selectedPickupId} onValueChange={setSelectedPickupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pickup..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pickups.map((pickup) => (
                      <SelectItem key={pickup.id} value={pickup.id}>
                        {pickup.pickup_id} - {pickup.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Type</Label>
                <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's the issue?" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupIssues.map((issue) => (
                      <SelectItem key={issue} value={issue}>
                        {issue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowOtherField(!showOtherField)}
                className="w-full"
                type="button"
              >
                Other
              </Button>
              
              {showOtherField && (
                <div className="space-y-2">
                  <Label htmlFor="custom-message">Describe your issue</Label>
                  <Textarea 
                    id="custom-message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      case 'payment':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={goBackToStep1}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-medium">Payment Issue</h3>
                <p className="text-sm text-muted-foreground">Select your invoice and describe the issue</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice">Select Invoice</Label>
                <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an invoice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_id} - ${invoice.net_payout_usd}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Type</Label>
                <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's the issue?" />
                  </SelectTrigger>
                  <SelectContent>
                    {walletIssues.map((issue) => (
                      <SelectItem key={issue} value={issue}>
                        {issue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowOtherField(!showOtherField)}
                className="w-full"
                type="button"
              >
                Other
              </Button>
              
              {showOtherField && (
                <div className="space-y-2">
                  <Label htmlFor="custom-message">Describe your issue</Label>
                  <Textarea 
                    id="custom-message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      case 'others':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={goBackToStep1}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="font-medium">General Issue</h3>
                <p className="text-sm text-muted-foreground">Describe your issue</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="custom-message">Describe your issue</Label>
              <Textarea 
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={4}
              />
            </div>
          </div>
        );
        
      default:
        return null;
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
          onOpenChange={(open) => {
            setIsNewTicketModalOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            
            {currentStep === 1 ? renderStep1() : renderStep2()}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsNewTicketModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              {currentStep === 2 && (
                <Button 
                  onClick={handleCreateNewTicket}
                  className="bg-primary hover:bg-primary/90"
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    'Create Ticket'
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Support;
