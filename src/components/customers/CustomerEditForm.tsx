import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { CustomerWithLocation } from "@/services/customers";
import { CustomerAreaSelector } from "./CustomerAreaSelector";

interface CustomerEditFormProps {
  customer: CustomerWithLocation;
  onUpdate: (updates: Partial<CustomerWithLocation>) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function CustomerEditForm({
  customer,
  onUpdate,
  isLoading,
  onCancel,
}: CustomerEditFormProps) {
  // Only enable editing for: secondary_phone (if not present), address, is_work_address, city/governorate
  const [secondaryPhone, setSecondaryPhone] = useState(customer.secondary_phone || "");
  const [address, setAddress] = useState(customer.address || "");
  const [isWorkAddress, setIsWorkAddress] = useState(!!customer.is_work_address);
  const [area, setArea] = useState({
    governorateId: customer.governorate_id ?? "",
    governorateName: customer.governorate_name ?? "",
    cityId: customer.city_id ?? "",
    cityName: customer.city_name ?? "",
  });
  const canEditSecondaryPhone = !customer.secondary_phone;

  // Keep area selector in sync if city/governorate prop changes (when changing customer)
  useEffect(() => {
    setArea({
      governorateId: customer.governorate_id ?? "",
      governorateName: customer.governorate_name ?? "",
      cityId: customer.city_id ?? "",
      cityName: customer.city_name ?? "",
    });
  }, [customer.governorate_id, customer.governorate_name, customer.city_id, customer.city_name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...(canEditSecondaryPhone ? { secondary_phone: secondaryPhone || null } : {}),
      address: address || null,
      is_work_address: isWorkAddress,
      city_id: area.cityId || null,
      governorate_id: area.governorateId || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-1">
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
          <div className="text-xs text-muted-foreground mt-1">Secondary phone already registered; cannot edit.</div>
        )}
      </div>
      <div>
        <div className="font-semibold text-gray-700 mb-0.5">Area</div>
        <CustomerAreaSelector
          value={area}
          onChange={setArea}
        />
      </div>
      <div>
        <div className="font-semibold text-gray-700 mb-0.5">Address</div>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
      </div>
      <div className="flex items-center gap-2">
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
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#dc291e]" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save
        </Button>
      </div>
    </form>
  );
}
