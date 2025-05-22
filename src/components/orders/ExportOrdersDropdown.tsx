
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';

interface ExportOrdersDropdownProps {
  selectedOrdersCount: number;
  totalFilteredCount: number;
  className?: string;
}

export const ExportOrdersDropdown: React.FC<ExportOrdersDropdownProps> = ({
  selectedOrdersCount,
  totalFilteredCount,
  className,
}) => {
  const handleExport = (exportType: string, fileType: string) => {
    toast.success(`Exporting ${exportType} as ${fileType}`);
    // In a real implementation, this would call an API to generate the export
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Current Page</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white">
                <DropdownMenuItem onClick={() => handleExport("Current Page", "Excel CSV")}>
                  Excel CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("Current Page", "CSV")}>
                  Plain CSV
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>All Orders</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white">
                <DropdownMenuItem onClick={() => handleExport("All Orders", "Excel CSV")}>
                  Excel CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("All Orders", "CSV")}>
                  Plain CSV
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          
          {selectedOrdersCount > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Selected: {selectedOrdersCount} orders</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-white">
                  <DropdownMenuItem onClick={() => handleExport(`Selected: ${selectedOrdersCount} orders`, "Excel CSV")}>
                    Excel CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(`Selected: ${selectedOrdersCount} orders`, "CSV")}>
                    Plain CSV
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          
          {totalFilteredCount > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>{totalFilteredCount} orders matching your search</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-white">
                  <DropdownMenuItem onClick={() => handleExport(`${totalFilteredCount} orders matching your search`, "Excel CSV")}>
                    Excel CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport(`${totalFilteredCount} orders matching your search`, "CSV")}>
                    Plain CSV
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Orders by Date</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-white">
                <DropdownMenuItem onClick={() => handleExport("Orders by Date", "Excel CSV")}>
                  Excel CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("Orders by Date", "CSV")}>
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
