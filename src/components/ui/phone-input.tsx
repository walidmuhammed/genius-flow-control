
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
                "flex gap-2 px-3 rounded-r-none border-r-0 min-w-[5.5rem]",
                isFocused && "ring-2 ring-ring ring-offset-2"
              )}
              disabled={disabled}
            >
              <span 
                className="fi fi-squared fi-w-12"
                style={{ width: '24px', height: '18px' }}
                data-country={selectedCountry.toLowerCase()}
              />
              <span className="text-xs font-medium text-muted-foreground">{selectedOption?.dialCode}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[280px]" align="start" side="bottom">
            {open && (
              <Command>
                <CommandInput placeholder="Search country..." autoFocus />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.value}
                        onSelect={() => handleCountryChange(country.value)}
                        className="flex items-center gap-2 py-2"
                      >
                        <span 
                          className="fi fi-squared fi-w-12"
                          style={{ width: '24px', height: '18px' }}
                          data-country={country.value.toLowerCase()}
                        />
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

      {/* Flag icons CSS */}
      <style global jsx>{`
        .fi {
          position: relative;
          display: inline-block;
          overflow: hidden;
          vertical-align: middle;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
        }
        
        .fi-squared {
          border-radius: 3px;
        }
        
        .fi[data-country="lb"] {
          background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCA2NDAgNDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGg2NDB2NDgwSDBWMHoiLz48cGF0aCBmaWxsPSIjZjkwMDAwIiBkPSJNMCAwaDY0MHYxMjBIMFYwem0wIDM2MGg2NDB2MTIwSDBWMzYweiIvPjwvZz48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9IiMwMDkzMTIiIHN0cm9rZS13aWR0aD0iMjQiIGQ9Im0zMjAgMjQwLTYwLTEyMCAxMjAgMCAxMjAgMC02MCAxMjAgNjAgMTIwLTEyMCAwLTEyMCAwIDYwLTEyMHoiLz48L3N2Zz4=");
        }
        .fi[data-country="us"] {
          background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDgwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiNiZDBiMGIiIGQ9Ik0wIDBoNjQwdjM3LjVIMHptMCA3NS45aDY0MHYzNy41SDB6bTAgNzUuOWg2NDB2MzcuNUgwem0wIDc1LjloNjQwdjM3LjVIMHptMCA3NS45aDY0MHYzNy41SDB6bTAgNzUuOWg2NDB2MzcuNUgweiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDM3LjVoNjQwdjM3LjVIMHptMCA3NS45aDY0MHYzNy41SDB6bTAgNzUuOWg2NDB2MzcuNUgwem0wIDc1LjloNjQwdjM3LjVIMHptMCA3NS45aDY0MHYzNy41SDB6Ii8+PC9nPjxwYXRoIGZpbGw9IiMwMDIxNmEiIGQ9Ik0wIDBoMzAwdjIyNS4xSDB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0ibTIzLjQgMTAuM3YxNC44SDEwLjN2MTIuM2gxMy4xdjE0LjhoMTIuM1YzNy40aDEzLjFWMjUuMUgzNS43VjEwLjN6TTgzLjkgMTAuM3YxNC44SDcwLjh2MTIuM2gxMy4xdjE0LjhoMTIuM1YzNy40aDEzLjFWMjUuMUg5Ni4yVjEwLjN6bTYwLjQgMHYxNC44aC0xMy4xdjEyLjNIMTQ0djE0LjhoMTIuNFYzNy40aDEzLjFWMjUuMWgtMTMuMVYxMC4zem02MC41IDB2MTQuOGgtMTMuMXYxMi4zaDE3LjV2MzcuM0gyMjRWMzcuNGgxMy4xVjI1LjFoLTEzLjFWMTAuM3ptNjAuNSAwdjE0LjhoLTEzLjF2MTIuM2gxMy4xdjE0LjhoMTIuNFYzNy40aDEzLjFWMjUuMWgtMTMuMVYxMC4zem0tMjQxLjkgMzd2MTQuOUg5LjhWNzVoMTMuMXYxNC44aDEyLjNWNzVoMTMuMVY2Mi4yaC0xMy4xVjQ3LjN6bTYwLjUgMHYxNC45SDU3LjNWNzVoMTMuMXYxNC44aDEyLjNWNzVoMTMuMVY2Mi4yaC0xMy4xVjQ3LjN6bTYwLjQgMHYxNC45aC0xMy4xVjc1aDE3LjV2MzcuM2gxNS4yVjc1aDEzLjFWNjIuMmgtMTMuMVY0Ny4zem02MC41IDB2MTQuOWgtMTcuNVY3NWgxNy41djE0LjhoMTIuNFY3NWgxMy4xVjYyLjJoLTEzLjFWNDcuM3ptNjAuNSAwdjE0LjloLTEzLjFWNzVoMTMuMXYxNC44aDEyLjRWNzVoMTMuMVY2Mi4yaC0xMy4xVjQ3LjN6TTUzLjIgODQuNXYxNC45SDQwLjF2MTIuM2gxMy4xdjE0LjhoMTIuM3YtMTQuOGgxMy4xdi0xMi4zSDY1LjVWODQuNXptNjAuNSAwdjE0LjloLTEzLjF2MTIuM2gxMy4xdjE0LjhoMTIuNHYtMTQuOGgxMy4xdi0xMi4zaC0xMy4xVjg0LjV6bTYwLjQgMHYxNC45aC0xMy4xdjEyLjNoMTMuMXYxNC44aDEyLjR2LTE0LjhoMTMuMXYtMTIuM2gtMTMuMVY4NC41em02MC41IDB2MTQuOWgtMTMuMXYxMi4zaDE3LjV2MzcuNGgxNS4ydi0zNy40aDEzLjF2LTEyLjNoLTEzLjFWODQuNXptNjAuNSAwdjE0LjloLTEzLjF2MTIuM2gxMy4xdjE0LjhoMTIuNHYtMTQuOGgxMy4xdi0xMi4zaC0xMy4xVjg0LjV6bS0yNDEuOSAzN3YxNC45SDM5LjZ2MTIuM2gxMy4xdjE0LjloMTIuM3YtMTQuOWgxMy4xdi0xMi4zSDY1VjEyMS41em02MC41IDB2MTQuOUg4N3YxMi4zaDEzLjF2MTQuOWgxMi40di0xNC45aDEzLjF2LTEyLjNoLTEzLjFWMTIxLjV6bTYwLjQgMHYxNC45aC0xMy4xdjEyLjNoMTMuMXYxNC45aDEyLjR2LTE0LjloMTMuMXYtMTIuM2gtMTMuMVYxMjEuNXptNjAuNSAwdjE0LjloLTEzLjF2MTIuM2gxMy4xdjE0LjloMTIuNHYtMTQuOWgxMy4xdi0xMi4zaC0xMy4xVjEyMS41em02MC41IDB2MTQuOWgtMTMuMXYxMi4zaDE3LjV2MzcuNGgxOS43di0zNy40aDEzLjF2LTEyLjNoLTEzLjFWMTIxLjV6TTIzLjQgMTU4LjV2MTUuMkgxMC4zVjE4NmgxMy4xdjE0LjhoMTIuM1YxODZoMTMuMXYtMTIuM0gzNS43di0xNS4yem02MC41IDB2MTUuMkg3MC44VjE4NmgxMy4xdjE0LjhoMTIuM1YxODZoMTMuMXYtMTIuM0g5Ni4ydi0xNS4yem02MC40IDB2MTUuMmgtMTMuMVYxODZoMTcuNXYzNy4zSDIwOHYtMzcuM2gxMy4xdi0xMi4zaC0xMy4xdi0xNS4yem02MC41IDB2MTUuMmgtMTMuMVYxODZoMTMuMXYxNC44aDEyLjRWMTg2aDEzLjF2LTEyLjNoLTEzLjF2LTE1LjJ6bTYwLjUgMHYxNS4yaC0xMy4xVjE4NmgxMy4xdjE0LjhoMTIuNFYxODZoMTMuMXYtMTIuM2gtMTMuMXYtMTUuMnoiLz48L3N2Zz4=");
        }
        .fi[data-country="gb"] {
          background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDgwIj48cGF0aCBmaWxsPSIjMDAwMDZmIiBkPSJNMCAwaDY0MHY0ODBIMHoiLz48cGF0aCBzdHJva2U9IiNmZmYiIGQ9Ik0wIDBoNjQwdjQ4MEgweiIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI5NiIgZD0iTTAgMGw2NDAgNDgwbTAtNDgwTDAgNDgwIi8+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZWYxNjFmIiBzdHJva2Utd2lkdGg9IjMyIiBkPSJNMCAwbDY0MCA0ODBtMC00ODBMMCA0ODAiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjk5Ljk5OSAwaDQwdjQ4MGgtNDB6TTAgMjIwaDY0MHY0MEgweiIvPjxwYXRoIGZpbGw9IiNlZjE2MWYiIGQ9Ik0zMTkuOTk5IDBoMHY0ODBIMHYtMzIwaDMxOS45OTl6TTAgMjQwaHY0MGgzMTkuOTk5djIwMGg0MFYyODBoMjgwLjAwMXYtNDBINjAwIi8+PC9zdmc+");
        }
        .fi[data-country="fr"] {
          background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDgwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDY0MHY0ODBIMHoiLz48cGF0aCBmaWxsPSIjMDAyMzk1IiBkPSJNMCAwaDIxMnY0ODBIMHoiLz48cGF0aCBmaWxsPSIjRUYxNjFGIiBkPSJNNDI4IDBoMjEydjQ4MEg0Mjh6Ii8+PC9zdmc+");
        }
        .fi[data-country="ca"] {
          background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDgwIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDY0MHY0ODBIMHoiLz48cGF0aCBmaWxsPSIjZDUyYjFlIiBkPSJNMCAwaDI0MHY0ODBIMFM2NDAgNDgwIDY0MCA0ODBWMEg0MDB6Ii8+PHBhdGggZmlsbD0iI2Q1MmIxZSIgZD0ibTMyMCAyNDAtMS43IDUtMS43LTUtNS43IDEuNiA0LjUtMy41LTIuOS01IDQuOSAyLjkgNC45LTIuOS0yLjkgNS4xIDQuNSAzLjN6bS0yNC44LTQuNWwtMi45LTQuOS0yLjkgNC45IDEuOC01LjFMMjg2IDIyN2wzLjQtLjEgMS40LTQgMS41IDQgMy40LjEtNS40IDMuNSAxLjMgNS0uMS0uMU01NSAxODJsLTEuOCA1LjEtMS43LTUuMS01LjcgMS42IDQuNS0zLjUtMi45LTUuMSA0LjkgMi45IDQuOS0yLjktMi45IDUuMSA0LjUgMy41LTEuOC0xLjYgMS04LTMtNi41LTMgNi41IDF6bTI1Mi4yIDEzMS4xYTQ5LjggNDkuOCAwIDEgMS0yOS42LTY0IDQ5LjkgNDkuOSAwIDAgMSAyOS42IDY0em0tNC4xLTkuOC01LjgtMi45IDIuNC01LjItNS42IDEuNy0xLTUuOC00LjIgNC0zLjQtNC41Ljk1IDUuOS01LjYtMS44IDIuNyA1LTUuNyAyLjloNi1uLjM2TDMyMiAzMjBhNDEuOSA0MS45IDAgMSAwLTE5LTU0LjhsMS42LjctMSA1LjhMdG0tMTU3LjQtNDEuNS0yLjktNC45LTIuOSA0LjkgMS44LTUuMS01LjQtMy41IDMuNC0uMSAxLjQtNCAxLjYgNCAzLjQuMUAyODkgMjMwbDEuNC01LjEtLjEtLjJaTTk5IDE2NS45bC0xLjcgNS4xLTEuOC01LjEtNS43IDEuNiA0LjUtMy41LTIuOS01LjEgNC45IDIuOSA0LjktMi45LTIuOSA1LjEgNC41IDMuNS01LjgtMS42em0yMzcuMi0zNS4zLTEuNyA1LjEtMS44LTUuMS01LjcgMS42IDQuNS0zLjUtMi45LTUuMSA0LjkgMy4xIDQuOS0zLjEtMi45IDUuMSA0LjUgMy41LTUuOC0xLjYiLz48L3N2Zz4=");
        }
        .fi[data-country="ae"] {
          background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGg2NDB2NDgwSDB6Ii8+PHBhdGggZmlsbD0iI2NlMTEyNiIgZD0iTTAgMGgyNDB2NDgwSDB6Ii8+PHBhdGggZmlsbD0iIzAwNzMyZiIgZD0iTTQwMCAwaDI0MHY0ODBINDB6Ii8+PHBhdGggZmlsbD0iIzAwMCIgZD0iTTAgMGg2NDB2MTYwSDB6Ii8+PC9zdmc+");
        }
        
        /* Custom country flags - add more as needed */
        @keyframes loadFlag {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .fi {
          animation: loadFlag 0.3s ease-in-out;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          background-color: #f5f5f5;
        }
        
        /* In case the flag doesn't load, show a fallback */
        .fi::after {
          content: attr(data-country);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          text-transform: uppercase;
          color: transparent;
          background-color: transparent;
        }
      `}</style>
    </div>
  );
}

