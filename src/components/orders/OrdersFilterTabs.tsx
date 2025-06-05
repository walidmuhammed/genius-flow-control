
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  AlertTriangle,
  DollarSign,
  FileText
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
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200/50 dark:border-gray-700/30">
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = getTabIcon(tab.key);
            const isActive = activeTab === tab.key;
            
            return (
              <motion.button
                key={tab.key}
                className={cn(
                  "relative px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap rounded-full flex items-center gap-2 border backdrop-blur-sm",
                  isActive
                    ? 'text-white bg-[#DC291E] border-[#DC291E] shadow-lg shadow-[#DC291E]/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-white/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                )}
                onClick={() => onTabChange(tab.key)}
                whileHover={{ 
                  scale: 1.02,
                  y: -1
                }}
                whileTap={{ 
                  scale: 0.98,
                  y: 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
              >
                {/* Active background glow effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-[#DC291E] rounded-full"
                    layoutId="activeBackground"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}
                
                {/* Content */}
                <div className="relative flex items-center gap-2">
                  <Icon className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                  )} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count !== undefined && (
                    <Badge
                      className={cn(
                        "h-5 px-2 py-0 text-xs font-semibold transition-all duration-300 border-0",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      )}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
