import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { useGovernoratesAndCities } from '@/hooks/use-governorates-and-cities';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImprovedAreaSelectorProps {
  selectedGovernorateId?: string;
  selectedCityId?: string;
  onGovernorateChange: (governorateId: string, governorateName: string) => void;
  onCityChange: (cityId: string, cityName: string, governorateName: string) => void;
  placeholder?: string;
  error?: string;
}

export const ImprovedAreaSelector: React.FC<ImprovedAreaSelectorProps> = ({
  selectedGovernorateId,
  selectedCityId,
  onGovernorateChange,
  onCityChange,
  placeholder = "Select location",
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeGovernorateId, setActiveGovernorateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: governoratesData, isLoading: locationLoading } = useGovernoratesAndCities();

  // Lebanese governorates to show
  const lebanonGovernorates = [
    "Beirut", 
    "Mount Lebanon", 
    "North Lebanon", 
    "Akkar", 
    "Beqaa", 
    "Baalbek-Hermel", 
    "South Lebanon",
    "Nabatieh"
  ];

  const filteredGovernorates = governoratesData?.filter(g => 
    lebanonGovernorates.includes(g.name) &&
    (!searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const selectedGovernorate = governoratesData?.find(g => g.id === selectedGovernorateId);
  const selectedCity = selectedGovernorate?.cities?.find((c: any) => c.id === selectedCityId);

  const activeCities = activeGovernorateId 
    ? governoratesData?.find(g => g.id === activeGovernorateId)?.cities?.filter((c: any) =>
        !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    : [];

  const displayValue = selectedGovernorate && selectedCity 
    ? `${selectedCity.name}, ${selectedGovernorate.name}`
    : placeholder;

  const handleSelectLocation = (governorateId: string, cityId: string) => {
    const governorate = governoratesData?.find(g => g.id === governorateId);
    const city = governorate?.cities?.find((c: any) => c.id === cityId);
    
    if (governorate && city) {
      onGovernorateChange(governorateId, governorate.name);
      onCityChange(cityId, city.name, governorate.name);
    }
    
    setIsOpen(false);
    setSearchQuery('');
    setActiveGovernorateId(null);
  };

  return (
    <>
      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full justify-between h-8 text-xs font-normal",
            error && "border-red-300 text-red-900"
          )}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{displayValue}</span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Select Location</DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search locations..." 
              className="pl-9 h-9 text-sm" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="flex h-[350px] border rounded-lg overflow-hidden">
            {/* Governorates List */}
            <div className="w-1/2 border-r bg-muted/30">
              <div className="p-2 bg-muted border-b">
                <h3 className="text-sm font-medium">Governorate</h3>
              </div>
              
              <div className="overflow-y-auto h-[310px]">
                {locationLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <div>
                    {filteredGovernorates.map((governorate) => (
                      <button
                        key={governorate.id}
                        type="button"
                        className={cn(
                          "w-full p-2.5 text-left text-sm hover:bg-accent transition-colors",
                          activeGovernorateId === governorate.id && "bg-primary/10 text-primary"
                        )}
                        onClick={() => setActiveGovernorateId(governorate.id)}
                      >
                        {governorate.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Cities List */}
            <div className="w-1/2">
              <div className="p-2 bg-muted border-b">
                <h3 className="text-sm font-medium">City/Area</h3>
              </div>
              
              <div className="overflow-y-auto h-[310px]">
                {!activeGovernorateId ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Select a governorate first
                  </div>
                ) : (
                  <div>
                    {activeCities.length > 0 ? (
                      activeCities.map((city: any) => (
                        <button
                          key={city.id}
                          type="button"
                          className="w-full p-2.5 text-left text-sm hover:bg-accent transition-colors"
                          onClick={() => {
                            if (activeGovernorateId) {
                              handleSelectLocation(activeGovernorateId, city.id);
                            }
                          }}
                        >
                          {city.name}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No cities found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};