
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
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

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  tabs
}) => {
  const handleTabSelect = (tab: string) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sheet - Fixed height to prevent bottom nav overlap */}
          <motion.div
            className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-2xl z-50 max-h-[70vh] overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200/60 dark:border-gray-700/40 bg-white dark:bg-gray-800 sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Filter Orders
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filter Options - Scrollable content */}
            <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)', paddingBottom: '20px' }}>
              {tabs.map((tab) => {
                const Icon = getTabIcon(tab.key);
                const isActive = activeTab === tab.key;
                
                return (
                  <button
                    key={tab.key}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border",
                      isActive
                        ? 'bg-[#DB271E] text-white border-[#DB271E] shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                    )}
                    onClick={() => handleTabSelect(tab.key)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium text-left">{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <Badge
                        className={cn(
                          "h-6 px-2 py-0 text-xs font-semibold border-0",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        )}
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
