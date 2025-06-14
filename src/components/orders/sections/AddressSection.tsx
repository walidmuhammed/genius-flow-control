
import { FC } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AreaSelector } from "@/components/orders/AreaSelector";

type Props = {
  selectedGovernorateName: string;
  selectedCityName: string;
  onAreaSelected: (governorateName: string, cityName: string, governorateId: string, cityId: string) => void;
  errors: any;
  address: string;
  setAddress: (address: string) => void;
  isWorkAddress: boolean;
  setIsWorkAddress: (v: boolean) => void;
};

export const AddressSection: FC<Props> = ({
  selectedGovernorateName, selectedCityName, onAreaSelected,
  errors, address, setAddress, isWorkAddress, setIsWorkAddress,
}) => (
  <>
    <div className="space-y-2">
      <Label className={cn("text-sm font-medium", errors.area ? "text-red-600" : "text-gray-700")}>
        Area (Governorate & City)
      </Label>
      <AreaSelector
        selectedArea={selectedCityName}
        selectedGovernorate={selectedGovernorateName}
        onAreaSelected={onAreaSelected}
      />
      {errors.area && <p className="text-xs text-red-600">{errors.area}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="address" className={cn("text-sm font-medium", errors.address ? "text-red-600" : "text-gray-700")}>
        Address Details
      </Label>
      <Input id="address" placeholder="Building, street, landmark..." value={address}
        onChange={e => setAddress(e.target.value)}
        className={cn("h-10", errors.address ? "border-red-300" : "border-gray-300")}
      />
      {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
    </div>
    <div className="flex items-center space-x-3">
      <Checkbox id="work-address" checked={isWorkAddress} onCheckedChange={checked => {
        if (typeof checked === 'boolean') setIsWorkAddress(checked);
      }} className="border-gray-300" />
      <Label htmlFor="work-address" className="text-sm text-gray-700 cursor-pointer">
        This is a work/business address
      </Label>
    </div>
  </>
)
