
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
import { motion } from 'framer-motion';
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
      action: () => navigate('/orders/new'),
    },
    {
      icon: Calendar,
      label: 'Schedule Pickup',
      action: () => navigate('/pickups/new'),
    },
    {
      icon: MessageSquare,
      label: 'Create Ticket',
      action: () => navigate('/support'),
    },
  ];

  if (isMobile) {
    return (
      <motion.div
        className="fixed bottom-20 right-4 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "w-14 h-14 rounded-full shadow-lg bg-[#DC291E] hover:bg-[#DC291E]/90",
                "transition-all duration-300 hover:scale-110 active:scale-95"
              )}
            >
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="h-6 w-6" />
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-48 mb-2 rounded-2xl border-0 shadow-xl bg-white dark:bg-gray-900"
          >
            {createActions.map((action, index) => (
              <DropdownMenuItem
                key={action.label}
                onClick={action.action}
                className="rounded-xl p-3 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <action.icon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-300" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="bg-[#DC291E] hover:bg-[#DC291E]/90 shadow-sm rounded-xl"
          size="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-gray-200 dark:border-gray-700 shadow-xl">
        {createActions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.action}
            className="rounded-lg p-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
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
