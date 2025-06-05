
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  AlertTriangle,
  DollarSign,
  FileText,
  MoreHorizontal
} from 'lucide-react';

interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface OrdersFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: FilterTab[];
}

const getTabIcon = (key: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    all: FileText,
    new: Package,
    pending: Clock,
    inProgress: Truck,
    successful: CheckCircle,
    unsuccessful: XCircle,
    returned: RotateCcw,
    awaitingAction: AlertTriangle,
    paid: DollarSign,
  };
  
  return iconMap[key] || FileText;
};

export const OrdersFilterTabs: React.FC<OrdersFilterTabsProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  // Show primary tabs on all screens, additional tabs in dropdown on smaller screens
  const primaryTabs = tabs.slice(0, 6); // All, New, Pending, In Progress, Successful, Unsuccessful
  const secondaryTabs = tabs.slice(6); // Returned, Awaiting Action, Paid

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 shadow-sm">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          {/* Primary Tabs - Always Visible */}
          <div className="flex gap-2 flex-wrap">
            {primaryTabs.map((tab) => {
              const Icon = getTabIcon(tab.key);
              const isActive = activeTab === tab.key;
              
              return (
                <motion.button
                  key={tab.key}
                  className={cn(
                    "relative px-3 sm:px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-full flex items-center gap-2 border",
                    isActive
                      ? 'text-white bg-[#DB271E] border-[#DB271E] shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  onClick={() => onTabChange(tab.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && (
                    <Badge
                      className={cn(
                        "h-5 px-2 py-0 text-xs font-semibold border-0 ml-1",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      )}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Secondary Tabs Dropdown - Only show if there are secondary tabs */}
          {secondaryTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className={cn(
                    "px-3 py-2.5 h-auto rounded-full border-gray-200 dark:border-gray-700",
                    secondaryTabs.some(tab => tab.key === activeTab) && "border-[#DB271E] bg-[#DB271E]/5"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {secondaryTabs.map((tab) => {
                  const Icon = getTabIcon(tab.key);
                  const isActive = activeTab === tab.key;
                  
                  return (
                    <DropdownMenuItem
                      key={tab.key}
                      onClick={() => onTabChange(tab.key)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        isActive && "bg-[#DB271E]/10 text-[#DB271E]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <Badge variant="outline" className="ml-auto">
                          {tab.count}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};
