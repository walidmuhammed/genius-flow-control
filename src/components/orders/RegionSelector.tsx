
import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';

interface City {
  name: string;
  governorate: string;
}

interface RegionSelectorProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
  label?: string;
  placeholder?: string;
}

// Lebanese cities grouped by governorate
const LEBANON_CITIES: Record<string, string[]> = {
  'Beirut': ['Beirut', 'Achrafieh', 'Ras Beirut', 'Hamra', 'Verdun', 'Bachoura'],
  'Mount Lebanon': ['Baabda', 'Aley', 'Bsharri', 'Baskinta', 'Bikfaya', 'Broummana', 'Jounieh', 'Byblos', 'Kesrouan'],
  'North Lebanon': ['Tripoli', 'Zgharta', 'Batroun', 'Koura', 'Minieh-Danniyeh', 'Ehden'],
  'Akkar': ['Halba', 'Qoubaiyat', 'Bebnin', 'Menjez', 'Fnaydek'],
  'Beqaa': ['Zahlé', 'Bar Elias', 'Anjar', 'Joub Jannine', 'Rashaya'],
  'Baalbek-Hermel': ['Baalbek', 'Hermel', 'Deir el Ahmar', 'Qaa', 'Laboue'],
  'South Lebanon': ['Sidon', 'Tyre', 'Jezzine', 'Nabatieh', 'Marjayoun', 'Bint Jbeil']
};

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedCity,
  onCitySelect,
  label = "Area",
  placeholder = "Select an area"
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGovernorate, setExpandedGovernorate] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Flatten cities for search
  const allCities: City[] = Object.entries(LEBANON_CITIES).flatMap(
    ([governorate, cities]) => cities.map(city => ({ name: city, governorate }))
  );

  // Filter cities based on search query
  const filteredCities = searchQuery.trim() === '' 
    ? [] 
    : allCities.filter(city => 
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.governorate.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Focus search input when dialog opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Get governorate from selected city
  const getGovernorateFromCity = (cityName: string): string => {
    for (const [governorate, cities] of Object.entries(LEBANON_CITIES)) {
      if (cities.includes(cityName)) {
        return governorate;
      }
    }
    return '';
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    onCitySelect(city);
    setOpen(false);
    setSearchQuery('');
  };

  // Toggle governorate expansion
  const toggleGovernorate = (governorate: string) => {
    setExpandedGovernorate(expandedGovernorate === governorate ? null : governorate);
  };

  const selectedGovernorate = selectedCity ? getGovernorateFromCity(selectedCity) : '';

  return (
    <div className="space-y-2.5">
      <Label htmlFor="area-selector">{label}</Label>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        id="area-selector"
        className="w-full justify-between border-gray-200 hover:bg-gray-50/50 transition-all h-10"
        onClick={() => setOpen(true)}
      >
        <span className={selectedCity ? 'text-gray-900' : 'text-gray-400'}>
          {selectedCity || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 ml-2 opacity-70" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Area</DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-4 mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Search cities or governorates..."
              className="pl-9 pr-9 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {searchQuery ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-1">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={`${city.governorate}-${city.name}`}
                      type="button"
                      className={`
                        w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between
                        ${selectedCity === city.name 
                          ? 'bg-accent text-accent-foreground' 
                          : 'hover:bg-accent/50 text-gray-700'}
                      `}
                      onClick={() => handleCitySelect(city.name)}
                    >
                      <div>
                        <div className="font-medium">{city.name}</div>
                        <div className="text-xs text-gray-500">{city.governorate}</div>
                      </div>
                      {selectedCity === city.name && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 p-3 text-center">No cities found</p>
                )}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {Object.entries(LEBANON_CITIES).map(([governorate, cities]) => (
                  <Collapsible 
                    key={governorate} 
                    open={expandedGovernorate === governorate || governorate === selectedGovernorate}
                    onOpenChange={() => toggleGovernorate(governorate)}
                    className="border border-gray-200 rounded-md overflow-hidden"
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`w-full justify-between p-3 h-auto rounded-none border-0 ${
                          expandedGovernorate === governorate || governorate === selectedGovernorate
                            ? 'bg-accent/80 hover:bg-accent'
                            : 'hover:bg-accent/30 bg-gray-50/50'
                        }`}
                      >
                        <span className="font-medium">{governorate}</span>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                          (expandedGovernorate === governorate || governorate === selectedGovernorate) ? 'transform rotate-180' : ''
                        }`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animation-duration-150 border-t border-gray-100">
                      <div className="p-1">
                        {cities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            className={`
                              w-full text-left px-3 py-2 rounded-md flex items-center justify-between
                              ${selectedCity === city 
                                ? 'bg-accent text-accent-foreground' 
                                : 'hover:bg-accent/30 text-gray-700'}
                            `}
                            onClick={() => handleCitySelect(city)}
                          >
                            <span>{city}</span>
                            {selectedCity === city && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegionSelector;
