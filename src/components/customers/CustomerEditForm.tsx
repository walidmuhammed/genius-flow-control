import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ImprovedAreaSelector } from "@/components/orders/ImprovedAreaSelector";
import { CustomerWithLocation } from "@/services/customers";

interface CustomerEditFormProps {
  customer: CustomerWithLocation;
  onUpdate: (updates: Partial<CustomerWithLocation>) => void;
  isLoading: boolean;
  onCancel: () => void;
  isHorizontalLayout?: boolean; // Added for layout control
}

export default function CustomerEditForm({
  customer,
  onUpdate,
  isLoading,
  onCancel,
  isHorizontalLayout = false,
}: CustomerEditFormProps) {
  // Fields: only enable editing for: secondary_phone if not present, address, is_work_address, city/governorate
  const [secondaryPhone, setSecondaryPhone] = useState(customer.secondary_phone || "");
  const [address, setAddress] = useState(customer.address || "");
  const [isWorkAddress, setIsWorkAddress] = useState(!!customer.is_work_address);
  const [governorateId, setGovernorateId] = useState(customer.governorate_id || "");
  const [governorateName, setGovernorateName] = useState(customer.governorate_name || "");
  const [cityId, setCityId] = useState(customer.city_id || "");
  const [cityName, setCityName] = useState(customer.city_name || "");
  const canEditSecondaryPhone = !customer.secondary_phone;

  // Keep area selector in sync if city/governorate prop changes (when changing customer)
  useEffect(() => {
    setGovernorateId(customer.governorate_id || "");
    setGovernorateName(customer.governorate_name || "");
    setCityId(customer.city_id || "");
    setCityName(customer.city_name || "");
  }, [customer.governorate_id, customer.governorate_name, customer.city_id, customer.city_name]);

  function handleAreaSelect(governorateId: string, governorateName: string) {
    setGovernorateId(governorateId);
    setGovernorateName(governorateName);
    setCityId("");
    setCityName("");
  }
  function handleCitySelect(cityId: string, cityName: string, govName: string) {
    setGovernorateId(customer.governorate_id !== governorateId ? governorateId : customer.governorate_id || "");
    setGovernorateName(govName);
    setCityId(cityId);
    setCityName(cityName);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only allow updating allowed fields (as per the plan)
    onUpdate({
      ...(canEditSecondaryPhone ? { secondary_phone: secondaryPhone || null } : {}),
      address: address || null,
      is_work_address: isWorkAddress,
      city_id: cityId || null,
      governorate_id: governorateId || null,
    });
  };

  // Responsive layout: horizontal grid on desktop, vertical stack on mobile
  const mainWrapperClass = isHorizontalLayout
    ? "grid grid-cols-2 gap-4 items-start"
    : "space-y-5";

  // Render fields in grid as columns if isHorizontalLayout
  return (
    <form onSubmit={handleSubmit} className={mainWrapperClass} id="customer-edit-form">
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
            <div className="text-xs text-muted-foreground mt-1">Secondary phone already registered; cannot edit.</div>
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
          <div className="font-semibold text-gray-700 mb-0.5">Area</div>
          <ImprovedAreaSelector
            selectedGovernorateId={governorateId}
            selectedCityId={cityId}
            onGovernorateChange={handleAreaSelect}
            onCityChange={handleCitySelect}
            error={undefined}
          />
        </div>
        <div>
          <div className="font-semibold text-gray-700 mb-0.5">Address</div>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
        </div>
      </div>
    </form>
  );
}
