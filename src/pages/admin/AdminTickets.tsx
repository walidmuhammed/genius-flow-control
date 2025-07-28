
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminTickets } from '@/hooks/use-tickets';
import { AdminKpiCard } from '@/components/analytics/KpiCard';
import { Ticket, AlertTriangle, CheckCircle2, CircleDot } from 'lucide-react';
import { TicketListPanel } from '@/components/support/TicketListPanel';
import { TicketChatPanel } from '@/components/support/TicketChatPanel';
import { motion } from 'framer-motion';

const AdminTickets = () => {
  document.title = 'Support Tickets - Admin Panel';
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'New' | 'Processing' | 'Resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: tickets = [], isLoading } = useAdminTickets();

  // KPI calculations
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const urgentTickets = tickets.filter(t => t.category?.toLowerCase().includes('urgent')).length;

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-0px)] min-h-0 flex-1">
        {/* KPI Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <AdminKpiCard
            title="Total Tickets"
            value={totalTickets}
            icon={<Ticket className="w-5 h-5 text-blue-500" />} // blue-50 bg is in card
            textColor="text-blue-900"
          />
          <AdminKpiCard
            title="Open Tickets"
            value={openTickets}
            icon={<CircleDot className="w-5 h-5 text-yellow-500" style={{ background: 'transparent' }} />} // yellow-50 bg is in card
            textColor="text-yellow-900"
          />
          <AdminKpiCard
            title="Resolved"
            value={resolvedTickets}
            icon={<CheckCircle2 className="w-5 h-5 text-green-500" style={{ background: 'transparent' }} />} // green-50 bg is in card
            textColor="text-green-900"
          />
          <AdminKpiCard
            title="Urgent"
            value={urgentTickets}
            icon={<AlertTriangle className="w-5 h-5 text-red-500" style={{ background: 'transparent' }} />} // red-50 bg is in card
            textColor="text-red-900"
          />
        </motion.div>

        {/* Main Content - Two Panel Layout */}
        <motion.div className="flex-1 flex gap-6 min-h-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {/* Left Panel - Ticket List */}
          <div className="w-1/3 flex flex-col min-h-0 h-full">
            <TicketListPanel
              tickets={tickets}
              selectedTicket={selectedTicket}
              onSelectTicket={setSelectedTicket}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreateTicket={() => {}}
            />
          </div>

          {/* Right Panel - Chat View */}
          <div className="flex-1 min-h-0 h-full flex flex-col">
            <TicketChatPanel
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
              isAdmin={true}
            />
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminTickets;
