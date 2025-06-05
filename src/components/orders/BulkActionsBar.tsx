
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Printer, Trash2, Download, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkPrint: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  canDelete: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkPrint,
  onBulkExport,
  onBulkDelete,
  canDelete
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/30 rounded-2xl shadow-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#DC291E] text-white px-3 py-1.5 rounded-xl">
                {selectedCount} Selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkPrint}
                className="rounded-xl border-gray-200 dark:border-gray-700"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Labels
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkExport}
                className="rounded-xl border-gray-200 dark:border-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkDelete}
                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-gray-200 dark:border-gray-700"
                  >
                    More Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem>Assign Courier</DropdownMenuItem>
                  <DropdownMenuItem>Update Status</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Add to Pickup</DropdownMenuItem>
                  <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
