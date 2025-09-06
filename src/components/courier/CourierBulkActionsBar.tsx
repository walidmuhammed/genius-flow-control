import React from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, XCircle, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourierBulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkMarkPickedUp: () => void;
  onBulkMarkDelivered: () => void;
  onBulkMarkUnsuccessful: () => void;
}

export const CourierBulkActionsBar: React.FC<CourierBulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkMarkPickedUp,
  onBulkMarkDelivered,
  onBulkMarkUnsuccessful,
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
          className="bg-[#DB271E] text-white rounded-2xl shadow-lg border border-[#DB271E]/20 py-0 mb-4"
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
                  onClick={onBulkMarkPickedUp}
                  className="h-9 px-3 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-lg"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Mark Picked Up</span>
                  <span className="sm:hidden">Picked Up</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBulkMarkDelivered}
                  className="h-9 px-3 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Mark Delivered</span>
                  <span className="sm:hidden">Delivered</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBulkMarkUnsuccessful}
                  className="h-9 px-3 bg-red-600/20 hover:bg-red-600/30 text-white border-red-400/20 rounded-lg"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Mark Unsuccessful</span>
                  <span className="sm:hidden">Unsuccessful</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};