
import React from 'react';
import { Order } from './OrdersTableRow';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Eye, Printer, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    const baseClasses = "py-1 px-2 text-xs font-medium rounded-full";
    
    switch (status.toLowerCase()) {
      case 'new':
        return <Badge className={`${baseClasses} bg-blue-50 text-blue-700`}>{status}</Badge>;
      case 'pending pickup':
        return <Badge className={`${baseClasses} bg-orange-50 text-orange-700`}>{status}</Badge>;
      case 'in progress':
        return <Badge className={`${baseClasses} bg-purple-50 text-purple-700`}>{status}</Badge>;
      case 'successful':
        return <Badge className={`${baseClasses} bg-green-50 text-green-700`}>{status}</Badge>;
      case 'unsuccessful':
        return <Badge className={`${baseClasses} bg-red-50 text-red-700`}>{status}</Badge>;
      case 'returned':
        return <Badge className={`${baseClasses} bg-yellow-50 text-yellow-700`}>{status}</Badge>;
      case 'paid':
        return <Badge className={`${baseClasses} bg-teal-50 text-teal-700`}>{status}</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-gray-50 text-gray-700`}>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {orders.map((order) => (
        <div 
          key={order.id} 
          className={cn(
            "bg-white rounded-xl p-4 shadow-sm border transition-colors",
            selectedOrders.includes(order.id) 
              ? "border-[#DB271E]/50" 
              : "border-border/10"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={selectedOrders.includes(order.id)}
                onCheckedChange={() => toggleSelectOrder(order.id)}
                className="data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E]"
              />
              <div>
                <p className="font-medium text-sm">{order.id}</p>
                <p className="text-xs text-gray-500">{order.referenceNumber}</p>
              </div>
            </div>
            {getStatusBadge(order.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 mb-3">
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="text-sm font-medium">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="text-sm">{order.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm">{order.location.city}, {order.location.area}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-sm">${order.amount.valueUSD}</p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onViewDetails(order)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Order</DropdownMenuItem>
                  <DropdownMenuItem>Cancel Order</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      ))}
      
      <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-border/10 mt-4">
        <span className="text-sm text-muted-foreground">
          {orders.length} of 36 orders
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-[#DB271E] text-white border-[#DB271E]"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTableMobile;
