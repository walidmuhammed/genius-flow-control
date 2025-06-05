
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

export const OrdersFilterTabs: React.FC<OrdersFilterTabsProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 shadow-sm p-2">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            className={cn(
              "relative px-4 py-3 text-sm font-medium transition-all whitespace-nowrap rounded-xl min-w-0 flex-shrink-0 flex items-center gap-2",
              activeTab === tab.key
                ? 'text-white bg-[#DC291E] shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            )}
            onClick={() => onTabChange(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <Badge
                variant={activeTab === tab.key ? "secondary" : "outline"}
                className={cn(
                  "h-5 px-2 py-0 text-xs",
                  activeTab === tab.key
                    ? "bg-white/20 text-white border-white/30"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                )}
              >
                {tab.count}
              </Badge>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
