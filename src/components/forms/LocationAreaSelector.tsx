import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGovernoratesAndCities } from '@/hooks/use-governorates-and-cities';

interface LocationAreaSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const LocationAreaSelector: React.FC<LocationAreaSelectorProps> = ({
  value = '',
  onChange,
  placeholder = "Search location...",
  label = "Location",
  required = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: governoratesData, isLoading } = useGovernoratesAndCities();

  // Flatten all governorate-city combinations
  const locationOptions = useMemo(() => {
    if (!governoratesData) return [];
    
    const options: Array<{ value: string; label: string; governorate: string; city: string }> = [];
    
    governoratesData.forEach(governorate => {
      if (governorate.cities && governorate.cities.length > 0) {
        governorate.cities.forEach(city => {
          const optionValue = `${governorate.name} — ${city.name}`;
          options.push({
            value: optionValue,
            label: optionValue,
            governorate: governorate.name,
            city: city.name
          });
        });
      } else {
        // If no cities, just show governorate
        options.push({
          value: governorate.name,
          label: governorate.name,
          governorate: governorate.name,
          city: ''
        });
      }
    });
    
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [governoratesData]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return locationOptions;
    
    const term = searchTerm.toLowerCase();
    return locationOptions.filter(option => 
      option.label.toLowerCase().includes(term) ||
      option.governorate.toLowerCase().includes(term) ||
      option.city.toLowerCase().includes(term)
    );
  }, [locationOptions, searchTerm]);

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchTerm(''); // Clear search after selection
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label} {required && '*'}</Label>}
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading locations..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && '*'}</Label>}
      <Select value={value} onValueChange={handleSelect}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2 border-b">
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                {searchTerm ? 'No locations found' : 'No locations available'}
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationAreaSelector;