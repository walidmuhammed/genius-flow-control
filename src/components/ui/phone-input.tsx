"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { CountryCode, parsePhoneNumber, getCountryCallingCode, AsYouType, isValidNumberForRegion } from "libphonenumber-js";
import flags from "libphonenumber-js/metadata.min.json";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "./input";

// Get supported countries from metadata
const allCountries = Object.keys(flags.countries).map((code) => ({
  value: code as CountryCode,
  label: getCountryNameByCode(code as CountryCode),
  dialCode: `+${getCountryCallingCode(code as CountryCode)}`,
})).sort((a, b) => a.label.localeCompare(b.label));

// Country priorities - put Lebanon first
const priorityCountries = ["LB", "US", "GB", "FR", "CA", "AE"];
const countries = [
  ...priorityCountries
    .map((code) => allCountries.find((c) => c.value === code))
    .filter(Boolean) as typeof allCountries,
  ...allCountries.filter((c) => !priorityCountries.includes(c.value))
];

function getCountryNameByCode(code: CountryCode): string {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return regionNames.of(code) || code;
}

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: CountryCode) => void;
  defaultCountry?: CountryCode;
  onValidationChange?: (isValid: boolean) => void;
  inputClassName?: string;
  errorMessage?: string;
}

export function PhoneInput({
  value,
  onChange,
  onCountryChange,
  defaultCountry = "LB",
  onValidationChange,
  className,
  inputClassName,
  disabled,
  ...props
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(defaultCountry);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [isFocused, setIsFocused] = React.useState(false);
  
  // Auto-detect country from input value
  React.useEffect(() => {
    if (value && value.startsWith("+")) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed?.country) {
          setSelectedCountry(parsed.country);
          if (onCountryChange) {
            onCountryChange(parsed.country);
          }
        }
      } catch (e) {
        // Silent fail on parse error
      }
    }
  }, [value, onCountryChange]);
  
  // Validate phone number
  React.useEffect(() => {
    if (!value || value === "+" || value === `+${getCountryCallingCode(selectedCountry)}`) {
      setError("");
      if (onValidationChange) onValidationChange(false);
      return;
    }
    
    try {
      const parsed = parsePhoneNumber(value, selectedCountry);
      
      // Country-specific validations
      if (selectedCountry === "LB" && parsed.nationalNumber.length !== 8) {
        setError("Lebanese numbers must be 8 digits after +961");
        if (onValidationChange) onValidationChange(false);
        return;
      }
      
      const isValid = parsed.isValid();
      if (!isValid) {
        setError("Invalid phone number");
        if (onValidationChange) onValidationChange(false);
      } else {
        setError("");
        if (onValidationChange) onValidationChange(true);
      }
    } catch (e) {
      setError("Invalid phone number");
      if (onValidationChange) onValidationChange(false);
    }
  }, [value, selectedCountry, onValidationChange]);
  
  // Handle country change
  const handleCountryChange = (country: CountryCode) => {
    const dialCode = `+${getCountryCallingCode(country)}`;
    
    // If current value has a dial code, replace it
    let newValue = value;
    if (value.startsWith("+")) {
      try {
        const parsed = parsePhoneNumber(value);
        newValue = parsed?.nationalNumber ? dialCode + " " + parsed.nationalNumber : dialCode;
      } catch (e) {
        newValue = dialCode;
      }
    } else if (!value || value === "") {
      newValue = dialCode;
    } else {
      newValue = dialCode + " " + value.replace(/^\+\d+\s?/, "");
    }
    
    setSelectedCountry(country);
    onChange(newValue);
    if (onCountryChange) {
      onCountryChange(country);
    }
    setOpen(false);
  };
  
  // Format phone number as you type
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\s+/g, "");
    
    // If the user clears the input, reset to dial code
    if (!inputValue || inputValue === "") {
      onChange(`+${getCountryCallingCode(selectedCountry)}`);
      return;
    }
    
    // Handle case where user deletes the plus sign
    if (!inputValue.startsWith("+")) {
      inputValue = `+${inputValue}`;
    }
    
    // Format as you type using AsYouType
    const formattedNumber = new AsYouType(selectedCountry).input(inputValue);
    onChange(formattedNumber);
  };
  
  // Get the country flag emoji
  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const selectedOption = countries.find((country) => country.value === selectedCountry);
  
  return (
    <div className={cn("flex flex-col space-y-1.5", className)}>
      <div 
        className={cn(
          "flex relative",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex gap-1 px-3 rounded-r-none border-r-0",
                isFocused && "ring-2 ring-ring ring-offset-2"
              )}
              disabled={disabled}
            >
              <span className="text-base">{getFlagEmoji(selectedCountry)}</span>
              <span className="text-xs font-medium text-muted-foreground">{selectedOption?.dialCode}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[280px]" align="start" side="bottom">
            {open && (
              <Command>
                <CommandInput placeholder="Search country..." autoFocus />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.value}
                        onSelect={() => handleCountryChange(country.value)}
                      >
                        <span className="mr-2 text-base">{getFlagEmoji(country.value)}</span>
                        <span className="flex-1 truncate">{country.label}</span>
                        <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                        {selectedCountry === country.value && (
                          <Check className="ml-2 h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>
        
        <Input
          type="tel"
          className={cn(
            "rounded-l-none flex-1",
            error && "border-red-500 focus-visible:ring-red-500",
            inputClassName
          )}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
