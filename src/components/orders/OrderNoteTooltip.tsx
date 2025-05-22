
import React from 'react';
import { StickyNote } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface OrderNoteTooltipProps {
  note?: string;
}

const OrderNoteTooltip: React.FC<OrderNoteTooltipProps> = ({ note }) => {
  if (!note) return null;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="cursor-help transition-opacity hover:opacity-80">
            <StickyNote className="h-3.5 w-3.5 text-gray-500 hover:text-[#DB271E] transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs border border-border/10 shadow-lg rounded-lg bg-white p-3 animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
          sideOffset={5}
        >
          <p className="text-sm break-words">{note}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OrderNoteTooltip;
