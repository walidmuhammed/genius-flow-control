
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Ticket, Eye, Plus } from 'lucide-react';
import { useTickets } from '@/hooks/use-tickets';
import { EmptyState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDate } from '@/utils/format';

const Support: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: tickets = [], isLoading } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);

  document.title = "Support - Dashboard";

  // Handle URL parameters for modal opening (from global search)
  useEffect(() => {
    const modal = searchParams.get('modal');
    const id = searchParams.get('id');
    
    if (modal === 'details' && id && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        setSelectedTicketId(id);
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
            <Button className="bg-[#DC291E] hover:bg-[#c0211a] text-white">
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
                            {ticket.title}
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
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedTicketId(ticket.id);
                                setTicketDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
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
                  onAction={() => console.log('Create new ticket')}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Ticket Details Modal - Placeholder */}
        {ticketDetailsOpen && selectedTicketId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTicketDetailsOpen(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Ticket Details</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Support ticket details for ID: {selectedTicketId}
              </p>
              <Button onClick={() => setTicketDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Support;
