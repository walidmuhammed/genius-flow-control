
import React from 'react';
import { Order } from './OrdersTableRow';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Eye, MoreVertical, Edit, Phone, MapPin, DollarSign, Calendar, Package, Hash, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface OrdersTableMobileProps {
  orders: Order[];
  selectedOrders?: string[];
  toggleSelectOrder?: (orderId: string) => void;
  onViewDetails?: (order: Order) => void;
  showActions?: boolean;
}

const OrdersTableMobile: React.FC<OrdersTableMobileProps> = ({
  orders,
  selectedOrders = [],
  toggleSelectOrder = () => {},
  onViewDetails = () => {},
  showActions = true
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-md";
    
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className={`${baseClasses} bg-blue-50 text-blue-700 border-0`}>{status}</Badge>;
      case 'pending pickup':
        return <Badge className={`${baseClasses} bg-orange-50 text-orange-700 border-0`}>{status}</Badge>;
      case 'in progress':
        return <Badge className={`${baseClasses} bg-purple-50 text-purple-700 border-0`}>{status}</Badge>;
      case 'successful':
        return <Badge className={`${baseClasses} bg-green-50 text-green-700 border-0`}>{status}</Badge>;
      case 'unsuccessful':
        return <Badge className={`${baseClasses} bg-red-50 text-red-700 border-0`}>{status}</Badge>;
      case 'returned':
        return <Badge className={`${baseClasses} bg-yellow-50 text-yellow-700 border-0`}>{status}</Badge>;
      case 'paid':
        return <Badge className={`${baseClasses} bg-teal-50 text-teal-700 border-0`}>{status}</Badge>;
      case 'awaiting action':
        return <Badge className={`${baseClasses} bg-amber-50 text-amber-800 border-0`}>{status}</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-gray-50 text-gray-700 border-0`}>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-md border-0";
    
    switch (type.toLowerCase()) {
      case 'deliver':
        return <span className={`${baseClasses} bg-blue-50 text-blue-700`}>{type}</span>;
      case 'exchange':
        return <span className={`${baseClasses} bg-orange-50 text-orange-700`}>{type}</span>;
      case 'cash collection':
        return <span className={`${baseClasses} bg-green-50 text-green-700`}>{type}</span>;
      case 'return':
        return <span className={`${baseClasses} bg-red-50 text-red-700`}>{type}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-50 text-gray-700`}>{type}</span>;
    }
  };

  return (
    <div className="space-y-3">
      {orders.map((order, index) => (
        <motion.div 
          key={order.id} 
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg p-4 border transition-all duration-200",
            selectedOrders.includes(order.id) 
              ? "border-[#DB271E] bg-[#DB271E]/5" 
              : "border-gray-200 dark:border-gray-700"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.02 }}
          onClick={() => onViewDetails(order)}
        >
          {/* Header: Order ID + Status + Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={selectedOrders.includes(order.id)}
                onCheckedChange={() => toggleSelectOrder(order.id)}
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-[#DB271E]" />
                  <span className="font-semibold text-[#DB271E] text-sm">{order.id}</span>
                </div>
                {order.referenceNumber && (
                  <p className="text-xs text-gray-500 mt-1">{order.referenceNumber}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(order.status)}
              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {order.status === 'New' && (
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Order
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Label
                    </DropdownMenuItem>
                    {order.status === 'New' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                          Cancel Order
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{order.customer.name}</p>
              <p className="text-xs text-gray-500 truncate">{order.customer.phone}</p>
            </div>
          </div>
          
          {/* Location + Type */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                {order.location.city}, {order.location.area}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Package className="h-3 w-3 text-gray-400" />
                {getTypeBadge(order.type)}
              </div>
            </div>
          </div>
          
          {/* Amount + Date */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                {order.amount.valueUSD > 0 && (
                  <p className="text-sm font-semibold text-green-600">${order.amount.valueUSD}</p>
                )}
                {order.amount.valueLBP > 0 && (
                  <p className="text-xs text-gray-500">{order.amount.valueLBP.toLocaleString()} LBP</p>
                )}
                {order.amount.valueUSD === 0 && order.amount.valueLBP === 0 && (
                  <p className="text-xs text-gray-500">No collection</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-right">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(order.lastUpdate), 'MMM d')}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(order.lastUpdate), 'HH:mm')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default OrdersTableMobile;
