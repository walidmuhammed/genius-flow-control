
import React from 'react';
import { Check, Clock, AlertTriangle, Package, ArrowRight, ArrowDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/components/orders/OrdersTableRow';

interface OrderProgressBarProps {
  status: OrderStatus;
  type: 'Deliver' | 'Exchange' | 'Cash Collection' | 'Return';
  className?: string;
}

const OrderProgressBar: React.FC<OrderProgressBarProps> = ({ status, type, className }) => {
  // Determine progress path based on order type and status
  const getProgressSteps = (): OrderStatus[] => {
    if (type === 'Exchange') {
      return ['New', 'Pending Pickup', 'In Progress', 'Successful', 'Returned', 'Paid'];
    } else if (status === 'Unsuccessful' || status === 'Returned') {
      return ['New', 'Pending Pickup', 'In Progress', 'Unsuccessful', 'Returned', 'Paid'];
    } else {
      return ['New', 'Pending Pickup', 'In Progress', 'Successful', 'Paid'];
    }
  };

  const progressSteps = getProgressSteps();
  const currentStepIndex = progressSteps.indexOf(status);
  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return <Package className="h-5 w-5" />;
      case 'Pending Pickup':
        return <Clock className="h-5 w-5" />;
      case 'In Progress':
        return <ArrowRight className="h-5 w-5" />;
      case 'Heading to Customer':
        return <ArrowRight className="h-5 w-5" />;
      case 'Heading to You':
        return <ArrowDown className="h-5 w-5" />;
      case 'Successful':
        return <Check className="h-5 w-5" />;
      case 'Unsuccessful':
        return <AlertTriangle className="h-5 w-5" />;
      case 'Returned':
        return <ArrowDown className="h-5 w-5" />;
      case 'Paid':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: OrderStatus, isActive: boolean) => {
    if (!isActive) return 'bg-gray-200';
    
    switch (status) {
      case 'New':
        return 'bg-blue-500';
      case 'Pending Pickup':
        return 'bg-orange-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Heading to Customer':
        return 'bg-green-500';
      case 'Heading to You':
        return 'bg-teal-500';
      case 'Successful':
        return 'bg-emerald-500';
      case 'Unsuccessful':
        return 'bg-red-500';
      case 'Returned':
        return 'bg-sky-500';
      case 'Paid':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress indicator */}
      <div className="relative">
        {/* Progress bar background */}
        <div className="h-3 bg-gray-100 rounded-full" />
        
        {/* Filled progress bar */}
        <div 
          className="absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${((currentStepIndex + 1) / progressSteps.length) * 100}%`,
            background: 'linear-gradient(to right, var(--primary), var(--primary))' 
          }}
        />
        
        {/* Status indicator dots */}
        <div className="absolute top-0 left-0 w-full flex justify-between">
          {progressSteps.map((step, index) => (
            <div 
              key={index}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border-2 border-white -mt-1.5",
                getStatusColor(step, index <= currentStepIndex),
                index <= currentStepIndex ? "animate-scale-in" : ""
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-white">
                {getStatusIcon(step)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Status labels */}
      <div className="flex justify-between">
        {progressSteps.map((step, index) => (
          <div 
            key={index} 
            className={cn(
              "flex flex-col items-center text-center transition-opacity",
              index <= currentStepIndex ? "opacity-100" : "opacity-50"
            )}
            style={{ width: `${100 / progressSteps.length}%` }}
          >
            <span 
              className={cn(
                "text-xs font-medium mt-2",
                index === currentStepIndex ? "text-primary" : "text-gray-600"
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderProgressBar;
