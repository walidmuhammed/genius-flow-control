
import React, { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useGovernorates } from "@/hooks/use-governorates";
import { useCitiesByGovernorate } from "@/hooks/use-cities";

export interface CustomerAreaSelectorProps {
  value: { governorateId: string; cityId: string; governorateName: string; cityName: string };
  onChange: (next: { governorateId: string; cityId: string; governorateName: string; cityName: string }) => void;
  disabled?: boolean;
}

export function CustomerAreaSelector({ value, onChange, disabled }: CustomerAreaSelectorProps) {
  const { data: governorates = [] } = useGovernorates();
  const { data: cities = [] } = useCitiesByGovernorate(value.governorateId || undefined);

  // Memoized selected governorate/city
  const selectedGov = useMemo(
    () => governorates.find(g => g.id === value.governorateId),
    [governorates, value.governorateId]
  );
  const selectedCity = useMemo(
    () => cities.find(c => c.id === value.cityId),
    [cities, value.cityId]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-start px-3 py-2 h-10 text-left flex items-center gap-2"
        >
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className={selectedCity && selectedGov ? "text-gray-900" : "text-muted-foreground"}>
            {selectedCity && selectedGov
              ? `${selectedCity.name}, ${selectedGov.name}`
              : "Select city / governorate"}
          </span>
          <ChevronDown className="ml-auto w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] max-w-xs p-3 z-[100]">
        <div className="text-xs font-semibold mb-1 text-gray-500">Governorate</div>
        <div className="max-h-[120px] overflow-y-auto mb-3 flex flex-col gap-0.5">
          {governorates.map(g => (
            <button
              key={g.id}
              type="button"
              className={`flex items-center gap-2 px-2 py-1 rounded text-left w-full hover:bg-gray-50 ${g.id === value.governorateId ? "bg-gray-100" : ""}`}
              onClick={() => {
                onChange({
                  governorateId: g.id,
                  cityId: "",
                  governorateName: g.name,
                  cityName: "",
                });
              }}
            >
              {g.name}
              {g.id === value.governorateId && <Check className="w-4 h-4 text-primary ml-auto" />}
            </button>
          ))}
        </div>
        <div className="text-xs font-semibold mb-1 text-gray-500">City / Area</div>
        <div className="max-h-[120px] overflow-y-auto flex flex-col gap-0.5">
          {cities.length === 0 ? (
            <div className="text-xs text-muted-foreground px-2 py-1">Select a governorate first</div>
          ) : (
            cities.map(c => (
              <button
                key={c.id}
                type="button"
                className={`flex items-center gap-2 px-2 py-1 rounded text-left w-full hover:bg-gray-50 ${c.id === value.cityId ? "bg-gray-100 text-primary" : ""}`}
                onClick={() => {
                  if (selectedGov) {
                    onChange({
                      governorateId: selectedGov.id,
                      governorateName: selectedGov.name,
                      cityId: c.id,
                      cityName: c.name,
                    });
                  }
                }}
              >
                {c.name}
                {c.id === value.cityId && <Check className="w-4 h-4 text-primary ml-auto" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
