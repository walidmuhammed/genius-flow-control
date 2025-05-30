
import React from 'react';
import { Order } from './OrdersTableRow';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Eye, Printer, MoreVertical, ChevronLeft, ChevronRight, Edit, Phone, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface OrdersTableMobileProps {
  orders: Order[];
  selectedOrders: string[];
  toggleSelectOrder: (orderId: string) => void;
  onViewDetails: (order: Order) => void;
  showActions?: boolean;
}

const OrdersTableMobile: React.FC<OrdersTableMobileProps> = ({
  orders,
  selectedOrders,
  toggleSelectOrder,
  onViewDetails,
  showActions = true
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "py-1.5 px-3 text-xs font-medium rounded-full";
    
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200`}>{status}</Badge>;
      case 'pending pickup':
        return <Badge className={`${baseClasses} bg-orange-50 text-orange-700 border-orange-200`}>{status}</Badge>;
      case 'in progress':
        return <Badge className={`${baseClasses} bg-purple-50 text-purple-700 border-purple-200`}>{status}</Badge>;
      case 'successful':
        return <Badge className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}>{status}</Badge>;
      case 'unsuccessful':
        return <Badge className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>{status}</Badge>;
      case 'returned':
        return <Badge className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>{status}</Badge>;
      case 'paid':
        return <Badge className={`${baseClasses} bg-teal-50 text-teal-700 border-teal-200`}>{status}</Badge>;
      case 'awaiting action':
        return <Badge className={`${baseClasses} bg-amber-100 text-amber-800 border-amber-300`}>{status}</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-gray-50 text-gray-700 border-gray-200`}>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {orders.map((order, index) => (
        <motion.div 
          key={order.id} 
          className={cn(
            "bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200",
            selectedOrders.includes(order.id) 
              ? "border-[#DC291E]/30 bg-[#DC291E]/5" 
              : "hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <Checkbox 
                checked={selectedOrders.includes(order.id)}
                onCheckedChange={() => toggleSelectOrder(order.id)}
                className="data-[state=checked]:bg-[#DC291E] data-[state=checked]:border-[#DC291E] rounded-md"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{order.id}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.referenceNumber}</p>
              </div>
            </div>
            {getStatusBadge(order.status)}
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Phone className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{order.customer.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{order.location.city}, {order.location.area}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{order.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${order.amount.valueUSD}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Collection Amount</p>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onViewDetails(order)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 rounded-xl border-gray-200 dark:border-gray-700 shadow-xl">
                  <DropdownMenuItem className="rounded-lg">View Order Details</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">Edit Order</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">Print Shipping Label</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 rounded-lg">Cancel Order</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </motion.div>
      ))}
      
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {orders.length} of 36 orders
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl border-gray-200 dark:border-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl bg-[#DC291E] text-white border-[#DC291E] hover:bg-[#DC291E]/90"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-xl border-gray-200 dark:border-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default OrdersTableMobile;
