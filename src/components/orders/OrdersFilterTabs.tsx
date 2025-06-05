
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  // Mobile view - show Filters button
  if (isMobile) {
    const activeTabData = tabs.find(tab => tab.key === activeTab);
    
    return (
      <>
        <div className="px-4 sm:px-6 pb-4 border-b border-gray-200/30 dark:border-gray-700/30">
          <Button
            variant="outline"
            onClick={() => setIsMobileSheetOpen(true)}
            className="w-full justify-between h-11 border-gray-200/60 dark:border-gray-700/40 rounded-xl bg-white dark:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>{activeTabData?.label || 'All Orders'}</span>
            </div>
            {activeTabData?.count !== undefined && (
              <Badge variant="outline" className="bg-gray-50 dark:bg-gray-700">
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

  // Desktop/Tablet view - single row, no "More" button
  return (
    <div className="px-4 sm:px-6 pb-4 border-b border-gray-200/30 dark:border-gray-700/30">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {tabs.map((tab) => {
          const Icon = getTabIcon(tab.key);
          const isActive = activeTab === tab.key;
          
          return (
            <motion.button
              key={tab.key}
              className={cn(
                "relative px-3 lg:px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap rounded-xl flex items-center gap-2 border flex-shrink-0",
                isActive
                  ? 'text-white bg-[#DB271E] border-[#DB271E] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => onTabChange(tab.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {/* Only show count badge for active tab */}
              {isActive && tab.count !== undefined && (
                <Badge
                  className="h-5 px-2 py-0 text-xs font-semibold border-0 bg-white/20 text-white ml-1"
                >
                  {tab.count}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
