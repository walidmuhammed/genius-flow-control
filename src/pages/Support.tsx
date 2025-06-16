import React, { useState } from 'react';
import { Search, Filter, Clock, Package, ArrowLeft, Package2, Wallet, FileText, Send, Loader2, Ticket, Paperclip } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTickets, useTicket, useTicketMessages, useCreateTicket, useAddTicketMessage, useUpdateTicketStatus } from '@/hooks/use-tickets';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { TicketCategory } from '@/services/tickets';
import type { OrderWithCustomer } from '@/services/orders';
import type { Pickup } from '@/services/pickups';
import type { Invoice } from '@/services/invoices';
import OrderSelectionModal from '@/components/support/OrderSelectionModal';
import PickupSelectionModal from '@/components/support/PickupSelectionModal';
import InvoiceSelectionModal from '@/components/support/InvoiceSelectionModal';

const Support: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [newTicketCategory, setNewTicketCategory] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCustomer | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [showOtherField, setShowOtherField] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch tickets
  const {
    data: tickets = [],
    isLoading: isLoadingTickets
  } = useTickets();

  // Fetch selected ticket
  const {
    data: selectedTicket
  } = useTicket(selectedTicketId || undefined);

  // Fetch ticket messages
  const {
    data: ticketMessages = []
  } = useTicketMessages(selectedTicketId || undefined);

  // Mutations
  const createTicketMutation = useCreateTicket();
  const addTicketMessageMutation = useAddTicketMessage();
  const updateTicketStatusMutation = useUpdateTicketStatus();

  // Filter tickets based on search query and active filter
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.id.includes(searchQuery);
    
    if (activeFilter === 'all') return matchesSearch;
    return matchesSearch && ticket.status.toLowerCase() === activeFilter.toLowerCase();
  });

  // Issue options for different categories
  const orderIssues = ['Delayed delivery', 'Missing item', 'Damaged order', 'Wrong delivery address', 'Order not delivered'];
  const pickupIssues = ['Delayed pickup', 'Pickup not completed', 'Wrong pickup address', 'Items not collected', 'Courier issues'];
  const walletIssues = ['Payment not received', 'Invoice discrepancy', 'Missing transaction', 'Incorrect amounts', 'Payment delays'];

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
          if (!selectedOrder || !selectedIssue) {
            toast.error('Please select an order and issue type');
            return;
          }
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
          if (!selectedPickup || !selectedIssue) {
            toast.error('Please select a pickup and issue type');
            return;
          }
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
          if (!selectedInvoice || !selectedIssue) {
            toast.error('Please select an invoice and issue type');
            return;
          }
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
    setSelectedOrder(null);
    setSelectedPickup(null);
    setSelectedInvoice(null);
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
        return <Badge className="bg-blue-500 text-white">New</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-500 text-white">Resolved</Badge>;
      case 'Closed':
        return <Badge className="bg-gray-500 text-white">Closed</Badge>;
      default:
        return <Badge className="bg-purple-500 text-white">Processing</Badge>;
    }
  };

  const getCategoryTitle = (categoryKey: string): TicketCategory => {
    switch (categoryKey) {
      case 'orders':
        return 'Order Issue';
      case 'pickups':
        return 'Pickup Issue';
      case 'return':
        return 'Return Issue';
      case 'payment':
        return 'Payment Issue';
      case 'technical':
        return 'Technical Issue';
      case 'delay':
        return 'Delay Delivery';
      default:
        return 'Other';
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
    setSelectedOrder(null);
    setSelectedPickup(null);
    setSelectedInvoice(null);
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
        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleCategorySelect('orders')}>
          <Package className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Orders</div>
            <div className="text-sm text-muted-foreground">(Forward or Return)</div>
            <p className="text-sm text-muted-foreground mt-1">Delayed delivery, Damaged order, Missing item...etc</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleCategorySelect('pickups')}>
          <Clock className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Pickups</div>
            <p className="text-sm text-muted-foreground mt-1">Delay pickup, Fake update...etc</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleCategorySelect('payment')}>
          <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium">Payment and Wallet</div>
            <p className="text-sm text-muted-foreground mt-1">Issues you face with your payments or financial issues</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors" onClick={() => handleCategorySelect('others')}>
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setShowOrderModal(true)}
                >
                  {selectedOrder ? (
                    <div className="text-left">
                      <div className="font-medium">{selectedOrder.reference_number}</div>
                      <div className="text-sm text-muted-foreground">{selectedOrder.customer.name}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Choose an order...</span>
                  )}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Type</Label>
                <select 
                  value={selectedIssue} 
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">What's the issue?</option>
                  {orderIssues.map(issue => (
                    <option key={issue} value={issue}>{issue}</option>
                  ))}
                </select>
              </div>
              
              <Button variant="outline" onClick={() => setShowOtherField(!showOtherField)} className="w-full" type="button">
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setShowPickupModal(true)}
                >
                  {selectedPickup ? (
                    <div className="text-left">
                      <div className="font-medium">{selectedPickup.pickup_id}</div>
                      <div className="text-sm text-muted-foreground">{selectedPickup.location}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Choose a pickup...</span>
                  )}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Type</Label>
                <select 
                  value={selectedIssue} 
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">What's the issue?</option>
                  {pickupIssues.map(issue => (
                    <option key={issue} value={issue}>{issue}</option>
                  ))}
                </select>
              </div>
              
              <Button variant="outline" onClick={() => setShowOtherField(!showOtherField)} className="w-full" type="button">
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4"
                  onClick={() => setShowInvoiceModal(true)}
                >
                  {selectedInvoice ? (
                    <div className="text-left">
                      <div className="font-medium">{selectedInvoice.invoice_id}</div>
                      <div className="text-sm text-muted-foreground">${selectedInvoice.net_payout_usd}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Choose an invoice...</span>
                  )}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issue">Issue Type</Label>
                <select 
                  value={selectedIssue} 
                  onChange={(e) => setSelectedIssue(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">What's the issue?</option>
                  {walletIssues.map(issue => (
                    <option key={issue} value={issue}>{issue}</option>
                  ))}
                </select>
              </div>
              
              <Button variant="outline" onClick={() => setShowOtherField(!showOtherField)} className="w-full" type="button">
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
      <div className="flex h-full flex-col lg:flex-row">
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/3 border-r h-full flex flex-col">
          <div className="p-4 lg:p-6 border-b">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold">Support Tickets</h1>
                <p className="text-sm text-muted-foreground">Contact our support team and track your tickets.</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="mb-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="open" className="text-xs">New</TabsTrigger>
                <TabsTrigger value="processing" className="text-xs">Process</TabsTrigger>
                <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by ticket ID or subject..." 
                className="pl-10" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            
            <Button 
              onClick={() => setIsNewTicketModalOpen(true)} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Create New Ticket
            </Button>
          </div>
          
          <div className="p-4 text-sm text-muted-foreground border-b">
            Tickets ({filteredTickets.length})
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingTickets ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No tickets found. Create a new ticket to get help.</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className={`p-4 border-b cursor-pointer hover:bg-muted/40 transition-colors ${
                    selectedTicketId === ticket.id ? 'bg-muted/40 border-l-4 border-l-primary' : ''
                  }`} 
                  onClick={() => handleTicketClick(ticket.id)}
                >
                  <div className="flex justify-between mb-2">
                    <Badge variant="outline" className="bg-muted/80 text-muted-foreground text-xs">
                      {ticket.category}
                    </Badge>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="mb-2">
                    <p className="font-medium text-sm">TIC-{ticket.id.substring(0, 3)}</p>
                    <p className="text-sm text-muted-foreground truncate">{ticket.title}</p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Right Content */}
        <div className="flex-1 flex flex-col h-full">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-4 lg:p-6 border-b flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-2 lg:space-y-0">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      TIC-{selectedTicket.id.substring(0, 3)}
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
              
              {/* Chat Messages */}
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Initial ticket message */}
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
                  
                  {/* Ticket messages */}
                  {ticketMessages.map(message => (
                    <div className="flex gap-4" key={message.id}>
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {message.sender.charAt(0)}
                        </div>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg rounded-tl-none max-w-[80%]">
                        <p>{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Paperclip className="h-5 w-5" />
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
            <div className="flex flex-col items-center justify-center h-full text-center p-8 lg:p-16">
              <div className="mb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Ticket className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium">No ticket selected</h3>
              <p className="text-muted-foreground mt-2 max-w-md">Select a ticket from the list or create a new one to start a conversation with our support team.</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setIsNewTicketModalOpen(true)}>
                Create New Ticket
              </Button>
            </div>
          )}
        </div>

        {/* Selection Modals */}
        <OrderSelectionModal
          open={showOrderModal}
          onOpenChange={setShowOrderModal}
          onSelect={setSelectedOrder}
          selectedOrderId={selectedOrder?.id}
        />

        <PickupSelectionModal
          open={showPickupModal}
          onOpenChange={setShowPickupModal}
          onSelect={setSelectedPickup}
          selectedPickupId={selectedPickup?.id}
        />

        <InvoiceSelectionModal
          open={showInvoiceModal}
          onOpenChange={setShowInvoiceModal}
          onSelect={setSelectedInvoice}
          selectedInvoiceId={selectedInvoice?.id}
        />

        {/* New Ticket Dialog */}
        <Dialog open={isNewTicketModalOpen} onOpenChange={(open) => {
          setIsNewTicketModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            
            {currentStep === 1 ? renderStep1() : renderStep2()}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsNewTicketModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              {currentStep === 2 && (
                <Button 
                  onClick={handleCreateNewTicket} 
                  className="bg-primary hover:bg-primary/90" 
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Creating...
                    </>
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
