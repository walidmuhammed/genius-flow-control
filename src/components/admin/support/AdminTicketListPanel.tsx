
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { Ticket } from '@/services/tickets';
import { formatDate } from '@/utils/format';

interface AdminTicketListPanelProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
  activeFilter: 'all' | 'Open' | 'Processing' | 'Resolved';
  onFilterChange: (filter: 'all' | 'Open' | 'Processing' | 'Resolved') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const AdminTicketListPanel: React.FC<AdminTicketListPanelProps> = ({
  tickets,
  selectedTicket,
  onSelectTicket,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange
}) => {
  // Filter tickets based on status and search
  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = activeFilter === 'all' || ticket.status === activeFilter;
    const matchesSearch = !searchQuery || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Open
          </Badge>
        );
      case 'Processing':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <MessageCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'Resolved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
    }
  };

  const getLinkedEntityDisplay = (ticket: Ticket) => {
    if (!ticket.linked_entity_type || !ticket.linked_entity_id) return null;
    const entityId = ticket.linked_entity_id.slice(-6).toUpperCase();
    switch (ticket.linked_entity_type) {
      case 'order':
        return <span className="text-xs text-gray-500">Order #{entityId}</span>;
      case 'pickup':
        return <span className="text-xs text-gray-500">Pickup #{entityId}</span>;
      case 'invoice':
        return <span className="text-xs text-gray-500">Invoice #{entityId}</span>;
      default:
        return null;
    }
  };

  const getTicketCounts = () => {
    return {
      all: tickets.length,
      Open: tickets.filter(t => t.status === 'Open').length,
      Processing: tickets.filter(t => t.status === 'Processing').length,
      Resolved: tickets.filter(t => t.status === 'Resolved').length
    };
  };

  const counts = getTicketCounts();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Support Tickets</h2>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search tickets..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10" 
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as any)} className="h-full flex flex-col">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="Open" className="text-xs">
                Open ({counts.Open})
              </TabsTrigger>
              <TabsTrigger value="Processing" className="text-xs">
                Pending ({counts.Processing})
              </TabsTrigger>
              <TabsTrigger value="Resolved" className="text-xs">
                Resolved ({counts.Resolved})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedTicket?.id === ticket.id 
                        ? 'border-[#DC291E] bg-red-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => onSelectTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#DC291E] text-sm">
                          {ticket.ticket_number}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(new Date(ticket.created_at))}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                      {ticket.title}
                    </h3>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {ticket.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                      {getLinkedEntityDisplay(ticket)}
                    </div>
                    
                    {ticket.issue_description && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        Issue: {ticket.issue_description}
                      </p>
                    )}

                    {/* Client Info */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        Client: <span className="font-medium">Client #{ticket.created_by?.slice(-6) || 'Unknown'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
