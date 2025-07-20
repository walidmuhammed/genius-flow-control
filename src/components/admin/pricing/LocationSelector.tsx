import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGovernoratesAndCities } from '@/hooks/use-governorates-and-cities';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  value?: { governorateId?: string; cityId?: string; location?: string };
  onChange: (data: { governorateId?: string; cityId?: string; location?: string }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  allowEmpty?: boolean;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value = {},
  onChange,
  placeholder = "Select location...",
  label = "Location",
  required = false,
  error,
  allowEmpty = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: governoratesData, isLoading } = useGovernoratesAndCities();

  // Flatten all governorate-city combinations
  const locationOptions = useMemo(() => {
    if (!governoratesData) return [];
    
    const options: Array<{ 
      value: string; 
      label: string; 
      governorateId: string;
      cityId?: string;
      governorate: string; 
      city?: string 
    }> = [];
    
    // Add empty option if allowed
    if (allowEmpty) {
      options.push({
        value: 'none',
        label: 'No specific location',
        governorateId: '',
        governorate: '',
      });
    }
    
    governoratesData.forEach(governorate => {
      if (governorate.cities && governorate.cities.length > 0) {
        governorate.cities.forEach(city => {
          const optionValue = `${governorate.id}_${city.id}`;
          const optionLabel = `${governorate.name} → ${city.name}`;
          options.push({
            value: optionValue,
            label: optionLabel,
            governorateId: governorate.id,
            cityId: city.id,
            governorate: governorate.name,
            city: city.name
          });
        });
      } else {
        // If no cities, just show governorate
        options.push({
          value: governorate.id,
          label: governorate.name,
          governorateId: governorate.id,
          governorate: governorate.name,
        });
      }
    });
    
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [governoratesData, allowEmpty]);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return locationOptions;
    
    const term = searchTerm.toLowerCase();
    return locationOptions.filter(option => 
      option.label.toLowerCase().includes(term) ||
      option.governorate.toLowerCase().includes(term) ||
      (option.city && option.city.toLowerCase().includes(term))
    );
  }, [locationOptions, searchTerm]);

  // Get current display value
  const getCurrentValue = () => {
    if (!value?.governorateId && !value?.cityId) return allowEmpty ? 'none' : '';
    
    if (value.cityId) {
      return `${value.governorateId}_${value.cityId}`;
    } else if (value.governorateId) {
      return value.governorateId;
    }
    
    return allowEmpty ? 'none' : '';
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleSelect = (selectedValue: string) => {
    if (!selectedValue || selectedValue === 'none') {
      onChange({ governorateId: undefined, cityId: undefined, location: undefined });
      setSearchTerm('');
      return;
    }

    const selectedOption = locationOptions.find(opt => opt.value === selectedValue);
    if (selectedOption) {
      onChange({
        governorateId: selectedOption.governorateId || undefined,
        cityId: selectedOption.cityId || undefined,
        location: selectedOption.label !== 'No specific location' ? selectedOption.label : undefined
      });
    }
    setSearchTerm(''); // Clear search after selection
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label} {required && '*'}</Label>}
        <Select disabled>
          <SelectTrigger className={error ? 'border-destructive' : ''}>
            <SelectValue placeholder="Loading locations..." />
          </SelectTrigger>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label} {required && '*'}</Label>}
      <Select value={getCurrentValue()} onValueChange={handleSelect}>
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
            <SelectValue placeholder={placeholder} />
          </div>
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default LocationSelector;