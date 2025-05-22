
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Check, ChevronDown } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [displayValue, setDisplayValue] = useState<string>("");

  const { data: governorates = [] } = useGovernorates();
  const { data: cities = [] } = useCitiesByGovernorate(selectedGovernorateId);

  // Update display value when selection changes
  useEffect(() => {
    if (selectedCityId && selectedGovernorateId) {
      const governorate = governorates.find(g => g.id === selectedGovernorateId);
      const city = cities.find(c => c.id === selectedCityId);
      
      if (city && governorate) {
        setDisplayValue(`${city.name}, ${governorate.name}`);
        setSelectedGovernorate(governorate.name);
        setSelectedCity(city.name);
      }
    } else {
      setDisplayValue("");
    }
  }, [selectedGovernorateId, selectedCityId, governorates, cities]);

  // Filter governorates and cities based on search
  const filteredGovernorates = searchValue
    ? governorates.filter(g => 
        g.name.toLowerCase().includes(searchValue.toLowerCase()))
    : governorates;
  
  // Include cities in search results
  const citySearchResults = searchValue
    ? cities
        .filter(c => c.name.toLowerCase().includes(searchValue.toLowerCase()))
        .map(c => {
          const governorate = governorates.find(g => g.id === selectedGovernorateId);
          return { cityId: c.id, cityName: c.name, governorateName: governorate?.name || "" };
        })
    : [];
    
  const handleSelect = (itemId: string, itemType: 'governorate' | 'city', cityGovName?: string) => {
    if (itemType === 'governorate') {
      const governorate = governorates.find(g => g.id === itemId);
      if (governorate) {
        onGovernorateChange(itemId, governorate.name);
        setSelectedGovernorate(governorate.name);
        setSelectedCity(""); // Clear selected city when governorate changes
      }
    } else if (itemType === 'city') {
      const city = cities.find(c => c.id === itemId);
      const governorate = governorates.find(g => g.id === selectedGovernorateId);
      
      if (city && governorate) {
        onCityChange(itemId, city.name, governorate.name);
        setSelectedCity(city.name);
        setOpen(false);
      }
    }
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between border-input bg-transparent hover:bg-muted/30",
              error ? "border-red-500 ring-1 ring-red-500/20" : "",
              "h-10 px-3 py-2 text-left font-normal"
            )}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground/70" />
              <span className="truncate">
                {displayValue || placeholder}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder="Search area or governorate..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandList className="max-h-[320px]">
              <CommandEmpty>No matches found.</CommandEmpty>
              
              {/* Search Results section */}
              {searchValue && citySearchResults.length > 0 && (
                <CommandGroup heading="Search Results">
                  {citySearchResults.map(({ cityId, cityName, governorateName }) => (
                    <CommandItem
                      key={cityId}
                      value={`city-${cityId}`}
                      onSelect={() => handleSelect(cityId, 'city', governorateName)}
                      className="flex items-center gap-2"
                    >
                      <span className="flex-1">{cityName}, {governorateName}</span>
                      {selectedCityId === cityId && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Governorates section */}
              {filteredGovernorates.length > 0 && (
                <CommandGroup heading="Governorates">
                  {filteredGovernorates.map(governorate => (
                    <CommandItem
                      key={governorate.id}
                      value={`gov-${governorate.id}`}
                      onSelect={() => handleSelect(governorate.id, 'governorate')}
                      className="flex items-center gap-2 font-medium"
                    >
                      <span>{governorate.name}</span>
                      {selectedGovernorateId === governorate.id && !selectedCityId && (
                        <Check className="h-4 w-4 ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Areas/Cities section - only show if a governorate is selected */}
              {selectedGovernorateId && cities.length > 0 && (
                <CommandGroup heading={`Areas in ${selectedGovernorate}`}>
                  {cities
                    .filter(city => !searchValue || city.name.toLowerCase().includes(searchValue.toLowerCase()))
                    .map(city => (
                      <CommandItem
                        key={city.id}
                        value={`city-${city.id}`}
                        onSelect={() => handleSelect(city.id, 'city')}
                        className="pl-6"
                      >
                        <span>{city.name}</span>
                        {selectedCityId === city.id && <Check className="h-4 w-4 ml-auto" />}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}
