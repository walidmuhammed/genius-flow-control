
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
                "w-14 h-14 rounded-full shadow-xl",
                "bg-gradient-to-br from-[#DC291E] to-[#c0211a]",
                "hover:from-[#c0211a] hover:to-[#a61c16]",
                "shadow-[#DC291E]/30 hover:shadow-[#DC291E]/40",
                "transition-all duration-300 hover:scale-110 active:scale-95",
                "border-2 border-white dark:border-gray-900"
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
            className={cn(
              "w-48 mb-2 rounded-2xl border-0 shadow-2xl",
              "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
              "border border-gray-100 dark:border-gray-800"
            )}
          >
            {createActions.map((action, index) => (
              <DropdownMenuItem
                key={action.label}
                onClick={action.action}
                className="rounded-xl p-4 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
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
          className={cn(
            "bg-gradient-to-r from-[#DC291E] to-[#c0211a]",
            "hover:from-[#c0211a] hover:to-[#a61c16]",
            "shadow-sm shadow-[#DC291E]/20 hover:shadow-[#DC291E]/30",
            "rounded-xl h-10 px-4 font-medium",
            "transition-all duration-200 hover:scale-105 active:scale-95"
          )}
          size="default"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-48 rounded-xl shadow-xl",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
          "border border-gray-100 dark:border-gray-800"
        )}
      >
        {createActions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.action}
            className="rounded-lg p-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
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
