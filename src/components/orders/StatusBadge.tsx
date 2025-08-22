
import React from 'react';
import { OrderStatus } from './OrdersTableRow';

interface StatusBadgeProps {
  status: OrderStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'New':
      return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>New</span>;
    case 'Pending Pickup':
      return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>Pending Pickup</span>;
    case 'In Progress':
      return <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>In Progress</span>;
    case 'Successful':
      return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Successful</span>;
    case 'Unsuccessful':
      return <span className="px-3 py-1 bg-[#DB271E]/10 text-[#DB271E] rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#DB271E]"></span>Unsuccessful</span>;
    case 'Returned':
      return <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>Returned</span>;
    case 'paid':
      return <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>Paid</span>;
    case 'Assigned':
      return <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>Assigned</span>;
    case 'Awaiting Payment':
      return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>Awaiting Payment</span>;
    case 'On Hold':
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-600"></span>On Hold</span>;
    default:
      return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>{status}</span>;
  }
};

export default StatusBadge;
