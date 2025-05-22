
import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useGovernorates } from '@/hooks/use-governorates';
import { useCitiesByGovernorate } from '@/hooks/use-cities';
import { Governorate } from '@/services/governorates';
import { City } from '@/services/cities';
import { Skeleton } from '@/components/ui/skeleton';

interface AreaNestedSelectorProps {
  selectedGovernorateId: string;
  selectedCityId: string;
  onGovernorateChange: (governorateId: string, governorateName: string) => void;
  onCityChange: (cityId: string, cityName: string, governorateName: string) => void;
  className?: string;
  disabled?: boolean;
}

export function AreaNestedSelector({
  selectedGovernorateId,
  selectedCityId,
  onGovernorateChange,
  onCityChange,
  className,
  disabled
}: AreaNestedSelectorProps) {
  const [governorateOpen, setGovernorateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Fetch governorates and cities
  const { data: governorates, isLoading: governoratesLoading } = useGovernorates();
  const { data: cities, isLoading: citiesLoading } = useCitiesByGovernorate(selectedGovernorateId);

  // Update selected governorate when the data is loaded
  useEffect(() => {
    if (governorates && selectedGovernorateId) {
      const governorate = governorates.find(g => g.id === selectedGovernorateId);
      if (governorate) {
        setSelectedGovernorate(governorate);
      }
    }
  }, [governorates, selectedGovernorateId]);

  // Update selected city when the data is loaded
  useEffect(() => {
    if (cities && selectedCityId) {
      const city = cities.find(c => c.id === selectedCityId);
      if (city && selectedGovernorate) {
        setSelectedCity(city);
      }
    }
  }, [cities, selectedCityId, selectedGovernorate]);

  const handleGovernorateSelect = (governorateId: string) => {
    const governorate = governorates?.find(g => g.id === governorateId);
    if (governorate) {
      setSelectedGovernorate(governorate);
      setSelectedCity(null); // Reset city when governorate changes
      onGovernorateChange(governorateId, governorate.name);
      setGovernorateOpen(false);
    }
  };

  const handleCitySelect = (cityId: string) => {
    const city = cities?.find(c => c.id === cityId);
    if (city && selectedGovernorate) {
      setSelectedCity(city);
      onCityChange(cityId, city.name, selectedGovernorate.name);
      setCityOpen(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Governorate Dropdown */}
      <Popover open={governorateOpen} onOpenChange={setGovernorateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={governorateOpen}
            className="w-full justify-between"
            disabled={disabled || governoratesLoading}
          >
            {selectedGovernorate ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 opacity-70" />
                {selectedGovernorate.name}
              </div>
            ) : (
              <span className="text-muted-foreground">Select governorate</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search governorate..." className="h-9" />
            <CommandList>
              <CommandEmpty>No governorate found.</CommandEmpty>
              <CommandGroup>
                {governorates?.map((governorate) => (
                  <CommandItem
                    key={governorate.id}
                    value={governorate.name}
                    onSelect={() => handleGovernorateSelect(governorate.id)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 opacity-70" />
                    {governorate.name}
                    {governorate.id === selectedGovernorateId && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* City Dropdown - Only enabled if governorate is selected */}
      <Popover open={cityOpen} onOpenChange={setCityOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={cityOpen}
            className="w-full justify-between"
            disabled={disabled || !selectedGovernorateId || citiesLoading}
          >
            {selectedCity ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 opacity-70" />
                {selectedCity.name}
              </div>
            ) : (
              <span className="text-muted-foreground">
                {selectedGovernorateId ? "Select area" : "Select governorate first"}
              </span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          {citiesLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Command>
              <CommandInput placeholder="Search area..." className="h-9" />
              <CommandList>
                <CommandEmpty>No area found.</CommandEmpty>
                <CommandGroup>
                  {cities?.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={city.name}
                      onSelect={() => handleCitySelect(city.id)}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4 opacity-70" />
                      {city.name}
                      {city.id === selectedCityId && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
