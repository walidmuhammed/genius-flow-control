
import React, { useState } from 'react';
import { Plus, Package, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useScreenSize } from '@/hooks/useScreenSize';
import { cn } from '@/lib/utils';

const CreateButton: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const [isOpen, setIsOpen] = useState(false);

  const createActions = [
    {
      icon: Package,
      label: 'Create Order',
      action: () => navigate('/create-order'),
    },
    {
      icon: Calendar,
      label: 'Schedule Pickup',
      action: () => navigate('/schedule-pickup'),
    },
    {
      icon: MessageSquare,
      label: 'Create Ticket',
      action: () => navigate('/support'),
    },
  ];

  if (isMobile) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg bg-[#DC291E] hover:bg-[#DC291E]/90",
              "transition-all duration-200 hover:shadow-xl active:scale-95"
            )}
          >
            <Plus className={cn(
              "h-6 w-6 transition-transform duration-200",
              isOpen && "rotate-45"
            )} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          className="w-48 mb-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl"
        >
          {createActions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={action.action}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <action.icon className="h-4 w-4 mr-3 text-gray-600 dark:text-gray-300" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="bg-[#DC291E] hover:bg-[#DC291E]/90 shadow-sm"
          size="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl"
      >
        {createActions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.action}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <action.icon className="h-4 w-4 mr-3 text-gray-600 dark:text-gray-300" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateButton;
