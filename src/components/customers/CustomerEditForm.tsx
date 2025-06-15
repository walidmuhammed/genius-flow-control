
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerWithLocation } from "@/services/customers";

interface CustomerEditFormProps {
  customer: CustomerWithLocation;
  onUpdate: (updates: Partial<CustomerWithLocation>) => void;
  isLoading: boolean;
  onCancel: () => void;
  isHorizontalLayout?: boolean;
  cities: { id: string; name: string; governorate_id: string }[];
  governorates: { id: string; name: string }[];
}

export default function CustomerEditForm({
  customer,
  onUpdate,
  isLoading,
  onCancel,
  isHorizontalLayout = false,
  cities,
  governorates,
}: CustomerEditFormProps) {
  const [secondaryPhone, setSecondaryPhone] = useState(customer.secondary_phone || "");
  const [address, setAddress] = useState(customer.address || "");
  const [isWorkAddress, setIsWorkAddress] = useState(!!customer.is_work_address);
  const [governorateId, setGovernorateId] = useState(customer.governorate_id || "");
  const [cityId, setCityId] = useState(customer.city_id || "");
  const canEditSecondaryPhone = !customer.secondary_phone;

  useEffect(() => {
    setGovernorateId(customer.governorate_id || "");
    setCityId(customer.city_id || "");
  }, [customer.governorate_id, customer.city_id]);

  // When changing governorate, reset city!
  useEffect(() => {
    setCityId("");
  }, [governorateId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...(canEditSecondaryPhone ? { secondary_phone: secondaryPhone || null } : {}),
      address: address || null,
      is_work_address: isWorkAddress,
      city_id: cityId || null,
      governorate_id: governorateId || null,
    });
  };

  const mainWrapperClass = isHorizontalLayout
    ? "grid grid-cols-2 gap-8 items-start"
    : "space-y-6";

  return (
    <form onSubmit={handleSubmit} className={mainWrapperClass}>
      <div className="space-y-5 col-span-1">
        <div>
          <div className="font-semibold text-gray-700 mb-0.5">Name</div>
          <Input value={customer.name} disabled readOnly className="bg-gray-100" />
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-0.5">Phone</div>
          <Input value={customer.phone} disabled readOnly className="bg-gray-100" />
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-0.5">Secondary Phone</div>
          <Input
            value={secondaryPhone}
            onChange={(e) => setSecondaryPhone(e.target.value)}
            disabled={!canEditSecondaryPhone}
            readOnly={!canEditSecondaryPhone}
            className={canEditSecondaryPhone ? "" : "bg-gray-100"}
            placeholder="Enter secondary phone"
          />
          {!canEditSecondaryPhone && (
            <div className="text-xs text-muted-foreground mt-1">
              Secondary phone already registered; cannot edit.
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={isWorkAddress}
            onChange={(e) => setIsWorkAddress(e.target.checked)}
            id="isWorkAddress"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="isWorkAddress" className="block text-sm text-gray-700">
            Work Address
          </label>
        </div>
      </div>
      <div className="space-y-5 col-span-1">
        <div>
          <div className="font-semibold text-gray-700 mb-0.5">Governorate</div>
          <Select value={governorateId} onValueChange={setGovernorateId}>
            <SelectTrigger>
              <SelectValue placeholder="Select governorate" />
            </SelectTrigger>
            <SelectContent>
              {governorates.map(gov => (
                <SelectItem key={gov.id} value={gov.id}>
                  {gov.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-0.5">City</div>
          <Select
            value={cityId}
            onValueChange={setCityId}
            disabled={!governorateId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities
                .filter(city => city.governorate_id === governorateId)
                .map(city => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-0.5">Address</div>
          <Input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Address"
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#dc291e]" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
