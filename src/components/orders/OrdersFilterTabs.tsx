
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileFilterSheet } from './MobileFilterSheet';
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
  MoreHorizontal,
  Filter
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
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mobile view - just show a Filters button
  if (isMobile) {
    const activeTabData = tabs.find(tab => tab.key === activeTab);
    
    return (
      <>
        <div className="px-4 sm:px-6 pb-4 border-b border-gray-200/30 dark:border-gray-700/30">
          <Button
            variant="outline"
            onClick={() => setIsMobileSheetOpen(true)}
            className="w-full justify-between h-11 border-gray-200/60 dark:border-gray-700/40 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{activeTabData?.label || 'All Orders'}</span>
            </div>
            {activeTabData?.count !== undefined && (
              <Badge variant="outline" className="bg-gray-50">
                {activeTabData.count}
              </Badge>
            )}
          </Button>
        </div>

        <MobileFilterSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          activeTab={activeTab}
          onTabChange={onTabChange}
          tabs={tabs}
        />
      </>
    );
  }

  // Desktop/Tablet view
  const visibleTabs = tabs.slice(0, 8); // Show more tabs on desktop
  const hiddenTabs = tabs.slice(8);

  return (
    <div className="px-4 sm:px-6 pb-4 border-b border-gray-200/30 dark:border-gray-700/30">
      <div className="flex items-center gap-1.5 overflow-hidden">
        {/* Primary Tabs - Compressed for desktop */}
        {visibleTabs.map((tab) => {
          const Icon = getTabIcon(tab.key);
          const isActive = activeTab === tab.key;
          
          return (
            <motion.button
              key={tab.key}
              className={cn(
                "relative px-2.5 lg:px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-lg flex items-center gap-1.5 border flex-shrink-0",
                isActive
                  ? 'text-white bg-[#DB271E] border-[#DB271E] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => onTabChange(tab.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </motion.button>
          );
        })}

        {/* More dropdown for remaining tabs - Only show if there are hidden tabs */}
        {hiddenTabs.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "px-2.5 py-2 h-auto rounded-lg border-gray-200 dark:border-gray-700 flex-shrink-0",
                  hiddenTabs.some(tab => tab.key === activeTab) && "border-[#DB271E] bg-[#DB271E]/5"
                )}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span className="ml-1.5 hidden lg:inline text-xs">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {hiddenTabs.map((tab) => {
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
  );
};
