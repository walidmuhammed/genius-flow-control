import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdminBulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkPrint: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  canDelete: boolean;
}

export const AdminBulkActionsBar: React.FC<AdminBulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkPrint,
  onBulkExport,
  onBulkDelete,
  canDelete,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
            height: 0,
          }}
          animate={{
            opacity: 1,
            y: 0,
            height: 'auto',
          }}
          exit={{
            opacity: 0,
            y: -10,
            height: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="bg-[#DB271E] text-white rounded-2xl shadow-lg border border-[#DB271E]/20 py-0 my-[18px]"
        >
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Selection Info */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {selectedCount} order{selectedCount === 1 ? '' : 's'} selected
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBulkPrint}
                  className="h-9 px-3 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-lg"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Print Labels</span>
                  <span className="sm:hidden">Print</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBulkExport}
                  className="h-9 px-3 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export</span>
                </Button>

                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBulkDelete}
                    className="h-9 px-3 bg-red-600/20 hover:bg-red-600/30 text-white border-red-400/20 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Cancel</span>
                    <span className="sm:hidden">Cancel</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};