
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { Ticket } from '@/services/tickets';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdminTicketKPICardsProps {
  tickets: Ticket[];
}

export const AdminTicketKPICards: React.FC<AdminTicketKPICardsProps> = ({ tickets }) => {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'New').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
  const urgentTickets = tickets.filter(t => t.category === 'Orders Issue' || t.category === 'Payments and Wallet').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatCard
          title="Total Tickets"
          value={totalTickets.toString()}
          icon={<TicketIcon className="h-5 w-5 text-blue-600" />}
          className="bg-blue-50 border-blue-200"
          labelColor="text-blue-700"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatCard
          title="Open Tickets"
          value={openTickets.toString()}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          className="bg-yellow-50 border-yellow-200"
          labelColor="text-yellow-700"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StatCard
          title="Resolved Tickets"
          value={resolvedTickets.toString()}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          className="bg-green-50 border-green-200"
          labelColor="text-green-700"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <StatCard
          title="Urgent Tickets"
          value={urgentTickets.toString()}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          className="bg-red-50 border-red-200"
          labelColor="text-red-700"
        />
      </motion.div>
    </div>
  );
};
