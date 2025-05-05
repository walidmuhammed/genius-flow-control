
import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { parsePhoneNumber, isValidPhoneNumber, getCountryCallingCode, CountryCode } from "libphonenumber-js";
import flags from "libphonenumber-js/metadata.min";

type CountryData = {
  name: string;
  code: CountryCode;
  dialCode: string;
  flag: string;
};

// Get flags for countries from the flags library
const countries: CountryData[] = [
  { name: "Lebanon", code: "LB" as CountryCode, dialCode: "+961", flag: "🇱🇧" },
  { name: "United States", code: "US" as CountryCode, dialCode: "+1", flag: "🇺🇸" },
  { name: "Germany", code: "DE" as CountryCode, dialCode: "+49", flag: "🇩🇪" },
  { name: "Afghanistan", code: "AF" as CountryCode, dialCode: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL" as CountryCode, dialCode: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ" as CountryCode, dialCode: "+213", flag: "🇩🇿" },
  { name: "American Samoa", code: "AS" as CountryCode, dialCode: "+1-684", flag: "🇦🇸" },
  { name: "Andorra", code: "AD" as CountryCode, dialCode: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "AO" as CountryCode, dialCode: "+244", flag: "🇦🇴" },
  { name: "Argentina", code: "AR" as CountryCode, dialCode: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "AM" as CountryCode, dialCode: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "AU" as CountryCode, dialCode: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "AT" as CountryCode, dialCode: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "AZ" as CountryCode, dialCode: "+994", flag: "🇦🇿" },
  { name: "Bahrain", code: "BH" as CountryCode, dialCode: "+973", flag: "🇧🇭" },
  { name: "France", code: "FR" as CountryCode, dialCode: "+33", flag: "🇫🇷" },
  { name: "United Kingdom", code: "GB" as CountryCode, dialCode: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "CA" as CountryCode, dialCode: "+1", flag: "🇨🇦" },
  // You can add more countries as needed
];

export interface PhoneInputProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: CountryCode;
  label?: string;
  error?: string;
  showLabel?: boolean;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, defaultCountry = "LB", label = "Phone number", error, showLabel = true, id, disabled, placeholder, ...props }, ref) => {
    const [countryCode, setCountryCode] = React.useState<CountryCode>(defaultCountry);
    const [phoneNumber, setPhoneNumber] = React.useState<string>("");
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState<string>(value);
    const [countrySearchTerm, setCountrySearchTerm] = React.useState<string>("");
    const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0];

    const filteredCountries = React.useMemo(() => {
      if (!countrySearchTerm) return countries;
      
      return countries.filter((country) => {
        return (
          country.name.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
          country.dialCode.includes(countrySearchTerm)
        );
      });
    }, [countrySearchTerm]);

    // Reset the country search when closing the dropdown
    React.useEffect(() => {
      if (!open) {
        setTimeout(() => setCountrySearchTerm(""), 300);
      }
    }, [open]);

    // Initialize from props
    React.useEffect(() => {
      if (value) {
        try {
          const cleanedValue = value.replace(/\s+/g, "");
          setInputValue(cleanedValue);
          
          if (cleanedValue.startsWith("+")) {
            const phoneObj = parsePhoneNumber(cleanedValue);
            if (phoneObj) {
              setCountryCode(phoneObj.country as CountryCode || defaultCountry);
            }
          }
        } catch (error) {
          console.error("Error parsing phone number:", error);
        }
      }
    }, [value, defaultCountry]);

    const handleCountryChange = (code: CountryCode) => {
      setCountryCode(code);
      setOpen(false);
      
      // Update phone number with new country code
      const country = countries.find((c) => c.code === code);
      if (country) {
        try {
          const dialCode = country.dialCode;
          const nationalNumber = phoneNumber.replace(/^\+\d+\s*/, '');
          const newValue = `${dialCode}${nationalNumber ? ` ${nationalNumber}` : ''}`;
          setInputValue(newValue);
          onChange?.(newValue);
        } catch (error) {
          console.error("Error formatting number with new country code:", error);
        }
      }
    };

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      
      // Remove all spaces
      newValue = newValue.replace(/\s+/g, "");
      
      // Allow only digits, plus sign (at the beginning), and hyphens
      newValue = newValue.replace(/[^\d+\-]/g, "");
      
      if (newValue.startsWith("+")) {
        try {
          const phoneObj = parsePhoneNumber(newValue);
          if (phoneObj && phoneObj.country) {
            setCountryCode(phoneObj.country as CountryCode);
          }
        } catch (error) {
          // Invalid phone number format, proceed with input but don't change country
        }
      } else if (newValue && !newValue.startsWith("+")) {
        // If user starts typing without a +, add the selected country code
        const country = countries.find((c) => c.code === countryCode);
        if (country) {
          newValue = `${country.dialCode}${newValue}`;
        }
      }
      
      setInputValue(newValue);
      onChange?.(newValue);

      // Extract national number for validation
      const nationalNumber = newValue.replace(/^\+\d+\s*/, '');
      setPhoneNumber(nationalNumber);
    };

    const isInvalidLebaneseNumber = React.useMemo(() => {
      if (countryCode === "LB" && phoneNumber && phoneNumber.length > 0) {
        // For Lebanon, check if the number is exactly 8 digits after the country code
        const isIncomplete = phoneNumber.replace(/\D/g, '').length !== 8;
        return isIncomplete;
      }
      return false;
    }, [countryCode, phoneNumber]);

    const validationError = React.useMemo(() => {
      if (!inputValue || inputValue.length === 0) {
        return "";
      }

      try {
        const isValid = isValidPhoneNumber(inputValue);
        if (!isValid) {
          return "Invalid phone number format";
        }

        if (isInvalidLebaneseNumber) {
          return "Lebanese numbers must be 8 digits after +961";
        }
      } catch (error) {
        return "Invalid phone number";
      }

      return "";
    }, [inputValue, isInvalidLebaneseNumber]);

    // Format the phone number for display
    const formattedValue = React.useMemo(() => {
      try {
        if (inputValue && inputValue.startsWith("+")) {
          const phoneObj = parsePhoneNumber(inputValue);
          if (phoneObj) {
            return phoneObj.formatInternational();
          }
        }
      } catch (error) {
        // If formatting fails, return the raw input
      }
      return inputValue;
    }, [inputValue]);

    const errorToShow = error || validationError;

    // The key attribute here ensures we fully recreate the Command component when open changes
    // This helps avoid stale internal state issues that might cause the "undefined is not iterable" error
    const commandKey = `command-${open ? 'open' : 'closed'}-${countrySearchTerm}`;

    return (
      <div className="space-y-2">
        {showLabel && <div className="text-sm font-medium text-primary">{label}</div>}
        <div className="relative">
          <div className={cn(
            "flex h-12 items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 ring-offset-background",
            errorToShow ? "border-destructive" : "",
            className
          )}>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={open}
                  className="h-full px-3 py-2 text-sm flex-shrink-0 border-r border-input font-normal hover:bg-accent"
                  disabled={disabled}
                >
                  <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 max-h-[400px] overflow-y-auto">
                <Command key={commandKey} className="w-full">
                  <CommandInput 
                    placeholder="Search countries or codes" 
                    className="h-9"
                    value={countrySearchTerm}
                    onValueChange={(value) => {
                      setCountrySearchTerm(value || "");
                    }}
                  />
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {filteredCountries.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={`${country.name.toLowerCase()}-${country.dialCode}`}
                        onSelect={() => {
                          handleCountryChange(country.code);
                        }}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center">
                          <span className="mr-2 text-lg">{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {country.dialCode}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            
            <Input
              ref={ref}
              type="tel"
              id={id}
              className={cn(
                "border-0 h-full px-3 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent",
                errorToShow ? "placeholder:text-destructive/50" : ""
              )}
              value={formattedValue}
              onChange={handlePhoneNumberChange}
              placeholder={placeholder || `${selectedCountry.dialCode} (___) ___ ____`}
              disabled={disabled}
              {...props}
            />
            
            {errorToShow && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                <X className="h-4 w-4" />
              </div>
            )}
          </div>
          
          {errorToShow && (
            <p className="text-xs text-destructive mt-1">{errorToShow}</p>
          )}
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
