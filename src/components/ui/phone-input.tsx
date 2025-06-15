"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { CountryCode, parsePhoneNumber, getCountryCallingCode, isValidNumberForRegion } from "libphonenumber-js";
import flags from "libphonenumber-js/metadata.min.json";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { FlagIcon } from "./flag-icon";

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
  const [nationalNumber, setNationalNumber] = React.useState<string>("");
  
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
          
          // Extract the national number from the full number
          setNationalNumber(parsed.nationalNumber || "");
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
    
    // Keep only the national number part without dial code
    let newValue = nationalNumber;
    setSelectedCountry(country);
    onChange(dialCode + (newValue ? " " + newValue : ""));
    
    if (onCountryChange) {
      onCountryChange(country);
    }
    setOpen(false);
  };
  
  // Format phone number as you type
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\s+/g, "");
    
    // Extract just the national number (no dial code)
    let newNationalNumber = inputValue;
    
    // If user tries to enter a new plus sign or country code, ignore it
    if (inputValue.includes("+")) {
      newNationalNumber = inputValue.split("+")[1] || "";
      // Remove country code if present
      const countryCode = getCountryCallingCode(selectedCountry);
      if (newNationalNumber.startsWith(countryCode)) {
        newNationalNumber = newNationalNumber.substring(countryCode.length);
      }
    }
    
    setNationalNumber(newNationalNumber);
    
    // Always prepend the dial code
    const dialCode = `+${getCountryCallingCode(selectedCountry)}`;
    const formattedNumber = dialCode + (newNationalNumber ? " " + newNationalNumber : "");
    onChange(formattedNumber);
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
                "flex gap-2 px-3 rounded-r-none border-r-0 min-w-[6rem]",
                // Remove the ring styling that was causing red outline
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
              disabled={disabled}
            >
              <FlagIcon countryCode={selectedCountry} />
              <span className="text-xs font-medium">{selectedOption?.dialCode}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[320px]" align="start" side="bottom">
            {open && (
              <Command>
                <CommandInput placeholder="Search country..." autoFocus className="h-9" />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.value}
                        onSelect={() => handleCountryChange(country.value)}
                        className="flex items-center gap-2 py-2.5"
                      >
                        <FlagIcon countryCode={country.value} />
                        <span className="flex-1 truncate">{country.label}</span>
                        <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                        {selectedCountry === country.value && (
                          <Check className="ml-2 h-4 w-4 text-blue-600" />
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
            "rounded-l-none flex-1 text-base md:text-sm",
            error && "border-red-500 focus-visible:ring-red-500",
            inputClassName
          )}
          value={nationalNumber}
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
