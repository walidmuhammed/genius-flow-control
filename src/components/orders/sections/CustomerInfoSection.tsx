
import { FC } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  phone: string;
  setPhone: (phone: string) => void;
  phoneValid: boolean;
  setPhoneValid: (valid: boolean) => void;
  name: string;
  setName: (name: string) => void;
  errors: any;
  setErrors: (errors: any) => void;
  searchingCustomers: boolean;
  existingCustomer: any;
  isSecondaryPhone: boolean;
  setIsSecondaryPhone: (b: boolean) => void;
  secondaryPhone: string;
  setSecondaryPhone: (phone: string) => void;
  secondaryPhoneValid: boolean;
  setSecondaryPhoneValid: (valid: boolean) => void;
};

export const CustomerInfoSection: FC<Props> = ({
  phone, setPhone, phoneValid, setPhoneValid, name, setName,
  errors, setErrors, searchingCustomers, existingCustomer,
  isSecondaryPhone, setIsSecondaryPhone, secondaryPhone, setSecondaryPhone,
  secondaryPhoneValid, setSecondaryPhoneValid
}) => {
  return (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="phone" className={cn("text-sm font-medium", errors.phone ? "text-red-600" : "text-gray-700")}>
          Phone Number
        </Label>
        <PhoneInput id="phone" value={phone} onChange={setPhone} defaultCountry="LB"
          onValidationChange={setPhoneValid}
          placeholder="Enter phone number"
          className={cn("h-10", errors.phone ? "border-red-300" : "border-gray-300")}
        />
        {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
        {searchingCustomers && <p className="text-xs text-blue-600 flex items-center gap-1">
            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Searching...
          </p>}
        {existingCustomer && <p className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Customer found!
          </p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name" className={cn("text-sm font-medium", errors.name ? "text-red-600" : "text-gray-700")}>
          Full Name
        </Label>
        <Input id="name" placeholder="Enter customer full name" value={name}
          onChange={e => {
            setName(e.target.value);
            if (errors.name) {
              setErrors((prev: any) => ({ ...prev, name: undefined }));
            }
          }}
          className={cn("h-10", errors.name ? "border-red-300" : "border-gray-300")}
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
      </div>
    </div>
    {!isSecondaryPhone &&
      <Button type="button" variant="outline" size="sm" onClick={() => setIsSecondaryPhone(true)} className="text-xs h-8 mx-0 py-0 my-0">
        <Plus className="h-3 w-3 mr-1" />
        Add secondary phone
      </Button>
    }
    {isSecondaryPhone &&
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="secondary-phone" className={cn("text-sm font-medium", errors.secondaryPhone ? "text-red-600" : "text-gray-700")}>
          Secondary Phone
        </Label>
        <Button variant="ghost" size="sm" onClick={() => {
          setIsSecondaryPhone(false);
          setSecondaryPhone('');
          if (errors.secondaryPhone) {
            setErrors((prev: any) => ({ ...prev, secondaryPhone: undefined }));
          }
        }} className="text-xs h-6 px-2">Remove</Button>
      </div>
      <PhoneInput id="secondary-phone" value={secondaryPhone}
        onChange={setSecondaryPhone}
        defaultCountry="LB"
        onValidationChange={setSecondaryPhoneValid}
        placeholder="Enter secondary phone"
        className={cn("h-10", errors.secondaryPhone ? "border-red-300" : "border-gray-300")}
      />
      {errors.secondaryPhone && <p className="text-xs text-red-600">{errors.secondaryPhone}</p>}
    </div>}
  </>
  )
}
