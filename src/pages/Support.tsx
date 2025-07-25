
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useTickets } from '@/hooks/use-tickets';
import { motion } from 'framer-motion';
import { CreateTicketModal } from '@/components/support/CreateTicketModal';
import { TicketListPanel } from '@/components/support/TicketListPanel';
import { TicketChatPanel } from '@/components/support/TicketChatPanel';
import { Ticket } from '@/services/tickets';

const Support: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'New' | 'Processing' | 'Resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { isMobile } = useScreenSize();
  const { data: tickets = [], isLoading, error } = useTickets();

  // Handle URL parameters for global search modal opening
  React.useEffect(() => {
    const modal = searchParams.get('modal');
    const id = searchParams.get('id');
    
    if (modal === 'details' && id && tickets.length > 0) {
      const foundTicket = tickets.find(ticket => ticket.id === id);
      if (foundTicket) {
        setSelectedTicket(foundTicket);
        navigate('/support', { replace: true });
      } else {
        navigate('/support', { replace: true });
      }
    }
  }, [searchParams, tickets, navigate]);

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
      <div className="flex flex-col h-[calc(100vh-0px)] min-h-0 flex-1"> {/* Ensure full viewport height, min-h-0 for flex children */}
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-500 text-sm mt-1">
              Get help and manage your support tickets
            </p>
          </div>
        </motion.div>

        {/* Main Content - Two Panel Layout */}
        <motion.div 
          className="flex-1 flex gap-6 min-h-0" // flex-1 and min-h-0 for proper flexbox height
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Left Panel - Ticket List */}
          <div className={`${isMobile ? 'w-full' : 'w-1/3'} flex flex-col min-h-0 h-full`}> {/* h-full for flex child */}
            <TicketListPanel
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={setSelectedTicket}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreateTicket={() => setCreateTicketOpen(true)}
            />
          </div>

          {/* Right Panel - Chat View */}
          {!isMobile && (
            <div className="flex-1 min-h-0 h-full flex flex-col"> {/* h-full for flex child */}
              <TicketChatPanel
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
              />
            </div>
          )}
        </motion.div>

        {/* Mobile Chat Modal */}
        {isMobile && selectedTicket && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <TicketChatPanel
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
              isMobile={true}
            />
          </div>
        )}

        {/* Create Ticket Modal */}
        <CreateTicketModal
          open={createTicketOpen}
          onOpenChange={setCreateTicketOpen}
        />
      </div>
    </MainLayout>
  );
};

export default Support;
