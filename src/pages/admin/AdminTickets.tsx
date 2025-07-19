
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useTickets } from '@/hooks/use-tickets';
import { motion } from 'framer-motion';
import { AdminTicketKPICards } from '@/components/admin/support/AdminTicketKPICards';
import { AdminTicketListPanel } from '@/components/admin/support/AdminTicketListPanel';
import { AdminTicketChatPanel } from '@/components/admin/support/AdminTicketChatPanel';
import { Ticket } from '@/services/tickets';

const AdminTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Open' | 'Processing' | 'Resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tickets = [], isLoading, error } = useTickets();

  document.title = "Support Tickets - Admin Panel";

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#DC291E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading support tickets...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage customer support tickets and inquiries
            </p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <AdminTicketKPICards tickets={tickets} />

        {/* Main Content - Two Panel Layout */}
        <motion.div 
          className="flex-1 flex gap-6 min-h-0 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Left Panel - Ticket List */}
          <div className="w-1/3 flex flex-col min-h-0">
            <AdminTicketListPanel
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={setSelectedTicket}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Right Panel - Chat View */}
          <div className="flex-1 min-h-0">
            <AdminTicketChatPanel
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
            />
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminTickets;
