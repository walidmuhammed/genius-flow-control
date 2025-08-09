
import React from 'react';
import { CheckIcon, PackageIcon, TruckIcon, CircleDollarSignIcon, AlertCircleIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { OrderStatus } from './OrdersTableRow';
import { cn } from '@/lib/utils';

interface OrderProgressBarProps {
  status: OrderStatus;
  type: 'Deliver' | 'Exchange' | 'Cash Collection' | 'Return';
}

const OrderProgressBar: React.FC<OrderProgressBarProps> = ({ status, type }) => {
  // Define the steps based on order type and status
  const getSteps = () => {
    // Handle special statuses first
    if (status === 'Unsuccessful') {
      return ['New', 'Pending Pickup', 'Assigned', 'In Progress', 'Unsuccessful'];
    }
    if (status === 'Returned') {
      return ['New', 'Pending Pickup', 'Assigned', 'In Progress', 'Returned'];
    }
    if (status === 'On Hold') {
      return ['New', 'Pending Pickup', 'On Hold'];
    }
    if (status === 'Awaiting Payment') {
      return ['New', 'Pending Pickup', 'Assigned', 'In Progress', 'Awaiting Payment'];
    }
    if (status === 'Paid') {
      return ['New', 'Pending Pickup', 'Assigned', 'In Progress', 'Successful', 'Paid'];
    }
    
    // Exchange type special flow
    if (type === 'Exchange') {
      return ['New', 'Pending Pickup', 'Assigned', 'In Progress', 'Successful'];
    }
    
    // Default flow with new Assigned status
    return ['New', 'Pending Pickup', 'Assigned', 'In Progress', 'Successful'];
  };

  const steps = getSteps();

  // Calculate current step index
  const currentStepIndex = steps.findIndex(step => step === status);
  
  // Calculate progress percentage
  const progressPercentage = currentStepIndex >= 0 
    ? Math.round(((currentStepIndex + 1) / steps.length) * 100) 
    : 0;

  // Get icon for a step
  const getStepIcon = (step: string, isActive: boolean) => {
    const className = `h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`;
    
    switch(step) {
      case 'New':
        return <PackageIcon className={className} />;
      case 'Pending Pickup':
        return <AlertCircleIcon className={className} />;
      case 'Assigned':
      case 'In Progress':
        return <TruckIcon className={className} />;
      case 'Successful':
        return <CheckIcon className={className} />;
      case 'Unsuccessful':
      case 'On Hold':
        return <AlertCircleIcon className={className} />;
      case 'Awaiting Payment':
      case 'Paid':
        return <CircleDollarSignIcon className={className} />;
      default:
        return <CheckIcon className={className} />;
    }
  };

  // Get color for a step's status indicator
  const getStepColor = (step: string) => {
    switch(step) {
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
        return 'bg-[#DB271E]';
      case 'Returned':
        return 'bg-sky-500';
      case 'Paid':
        return 'bg-indigo-500';
      case 'Assigned':
        return 'bg-purple-500';
      case 'Awaiting Payment':
        return 'bg-amber-600';
      case 'On Hold':
        return 'bg-gray-600';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full space-y-4">
      <Progress 
        value={progressPercentage} 
        className="h-2 bg-gray-100"
      />
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = currentStepIndex >= index;
          const stepColor = getStepColor(step);
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center mb-2",
                isActive ? stepColor : 'bg-gray-200'
              )}>
                {getStepIcon(step, isActive)}
              </div>
              <span className={cn(
                "text-xs font-medium text-center max-w-[70px]",
                isActive ? "text-gray-900" : "text-gray-500"
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderProgressBar;
