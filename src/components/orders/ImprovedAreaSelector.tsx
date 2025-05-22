
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGovernorates } from "@/hooks/use-governorates";
import { useCitiesByGovernorate } from "@/hooks/use-cities";

interface ImprovedAreaSelectorProps {
  selectedGovernorateId: string;
  selectedCityId: string;
  onGovernorateChange: (governorateId: string, governorateName: string) => void;
  onCityChange: (cityId: string, cityName: string, governorateName: string) => void;
  error?: string;
  placeholder?: string;
}

export function ImprovedAreaSelector({
  selectedGovernorateId,
  selectedCityId,
  onGovernorateChange,
  onCityChange,
  error,
  placeholder = "Select an area"
}: ImprovedAreaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGovernorate, setActiveGovernorate] = useState<string | null>(selectedGovernorateId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayValue, setDisplayValue] = useState<string>("");
  
  const { data: governorates = [] } = useGovernorates();
  const { data: cities = [] } = useCitiesByGovernorate(activeGovernorate || undefined);

  const lebanonGovernorates = [
    "Beirut", 
    "Mount Lebanon", 
    "North Lebanon", 
    "Akkar", 
    "Beqaa", 
    "Baalbek-Hermel", 
    "South Lebanon"
  ];

  // Update display value when selection changes
  useEffect(() => {
    if (selectedCityId && selectedGovernorateId) {
      const governorate = governorates.find(g => g.id === selectedGovernorateId);
      const city = cities.find(c => c.id === selectedCityId);
      
      if (city && governorate) {
        setDisplayValue(`${city.name}, ${governorate.name}`);
      }
    } else {
      setDisplayValue("");
    }
  }, [selectedGovernorateId, selectedCityId, governorates, cities]);
  
  // Filter governorates and cities based on search
  const filteredGovernorates = searchQuery 
    ? governorates.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())) 
    : governorates;
    
  const filteredCities = searchQuery && cities
    ? cities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : cities;

  const handleSelectArea = (governorate: string, area: string, governorateId?: string, areaId?: string) => {
    if (governorateId && areaId) {
      onCityChange(areaId, area, governorate);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {/* Area Selector Trigger */}
      <div 
        className={cn(
          "flex items-center justify-between p-2.5 border rounded-md cursor-pointer hover:bg-gray-50",
          error ? "border-red-500 ring-1 ring-red-500/20" : "border-input bg-background",
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm">
            {displayValue || placeholder}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">Click to select</div>
      </div>
      
      {/* Area Selection Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Area</DialogTitle>
          </DialogHeader>
          
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search areas..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex h-[400px] mt-4 border rounded-md overflow-hidden">
            {/* Governorates List */}
            <div className="w-1/2 border-r overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b">
                <h3 className="text-sm font-medium">Governorate</h3>
              </div>
              
              <div>
                {filteredGovernorates
                  .filter(governorate => lebanonGovernorates.includes(governorate.name))
                  .map((governorate) => (
                    <div
                      key={governorate.id}
                      className={cn(
                        "p-2.5 text-sm cursor-pointer hover:bg-gray-50",
                        activeGovernorate === governorate.id ? 'bg-blue-50 text-blue-600' : ''
                      )}
                      onClick={() => setActiveGovernorate(governorate.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{governorate.name}</span>
                        {activeGovernorate === governorate.id && 
                          <Check className="h-4 w-4 text-blue-600" />
                        }
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Cities List */}
            <div className="w-1/2 overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b">
                <h3 className="text-sm font-medium">City/Area</h3>
              </div>
              
              {!activeGovernorate ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Select a governorate first
                </div>
              ) : filteredCities.length > 0 ? (
                <div>
                  {filteredCities.map((city) => (
                    <div
                      key={city.id}
                      className="p-2.5 text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        const governorate = governorates.find(g => g.id === city.governorate_id);
                        if (governorate) {
                          handleSelectArea(governorate.name, city.name, governorate.id, city.id);
                        }
                      }}
                    >
                      {city.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No cities found in this governorate
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
