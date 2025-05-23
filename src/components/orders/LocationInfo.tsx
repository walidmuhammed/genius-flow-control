
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin } from 'lucide-react';

interface LocationInfoProps {
  city: string;
  area: string;
  address?: string;
  showAddressInline?: boolean;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ 
  city, 
  area, 
  address,
  showAddressInline = false
}) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900">{city}</span>
      <span className="text-gray-500 text-xs mt-0.5">{area}</span>
      
      {address && showAddressInline && (
        <span className="text-gray-500 text-xs mt-1.5 line-clamp-2">
          <MapPin className="h-3 w-3 inline mr-1" />
          {address}
        </span>
      )}
      
      {address && !showAddressInline && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-gray-500 text-xs mt-1.5 cursor-pointer flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                View address
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-sm whitespace-normal break-words">{address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default LocationInfo;
