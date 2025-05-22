
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportOrdersDropdownProps {
  selectedOrdersCount?: number;
  totalFilteredCount?: number;
  className?: string;
}

export const ExportOrdersDropdown: React.FC<ExportOrdersDropdownProps> = ({
  selectedOrdersCount = 0,
  totalFilteredCount = 0,
  className
}) => {
  const handleExport = (type: string, format: string) => {
    toast.success(`Exporting ${type} as ${format}`);
    // In a real app, this would trigger an API call to export data
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Current Page
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleExport('Current Page', 'Excel CSV')}>
                  CSV for Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('Current Page', 'Plain CSV')}>
                  Plain CSV
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              All Orders
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleExport('All Orders', 'Excel CSV')}>
                  CSV for Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('All Orders', 'Plain CSV')}>
                  Plain CSV
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          
          {selectedOrdersCount > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Selected Orders ({selectedOrdersCount})
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleExport(`Selected (${selectedOrdersCount})`, 'Excel CSV')}>
                    CSV for Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(`Selected (${selectedOrdersCount})`, 'Plain CSV')}>
                    Plain CSV
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          
          {totalFilteredCount > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Orders matching search ({totalFilteredCount})
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleExport(`Filtered (${totalFilteredCount})`, 'Excel CSV')}>
                    CSV for Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(`Filtered (${totalFilteredCount})`, 'Plain CSV')}>
                    Plain CSV
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Orders by Date Range
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleExport('Date Range', 'Excel CSV')}>
                  CSV for Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('Date Range', 'Plain CSV')}>
                  Plain CSV
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
