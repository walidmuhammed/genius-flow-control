import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AreaSelector } from "@/components/orders/AreaSelector";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useCreateCustomer } from "@/hooks/use-customers";
import { PhoneInput } from "@/components/ui/phone-input";

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialState = {
  name: "",
  phone: "",
  secondary_phone: "",
  address: "",
  governorate: "",
  governorateId: "",
  city: "",
  cityId: "",
  is_work_address: false,
};

export default function AddCustomerModal({ open, onOpenChange }: AddCustomerModalProps) {
  const { isMobile } = useScreenSize();
  const [form, setForm] = useState(initialState);
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);
  const [loading, setLoading] = useState(false);

  const { mutate: createCustomer } = useCreateCustomer();

  const resetForm = () => {
    setForm(initialState);
    setShowSecondaryPhone(false);
  };

  function handleAreaSelected(governorate: string, area: string, governorateId?: string, cityId?: string) {
    setForm(prev => ({
      ...prev,
      governorate,
      city: area,
      governorateId: governorateId || "",
      cityId: cityId || "",
    }));
  }

  function validate() {
    if (!form.name.trim()) return "Full Name is required";
    if (!form.phone || form.phone.length < 8) return "Phone Number is required";
    if (!form.governorateId || !form.cityId) return "Please select both governorate and city";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);
    createCustomer(
      {
        name: form.name.trim(),
        phone: form.phone.trim(),
        secondary_phone: showSecondaryPhone && form.secondary_phone.trim() ? form.secondary_phone.trim() : null,
        address: form.address.trim(),
        governorate_id: form.governorateId,
        city_id: form.cityId,
        is_work_address: form.is_work_address,
      },
      {
        onSuccess: () => {
          toast.success("Customer added successfully");
          onOpenChange(false);
          resetForm();
          setLoading(false);
        },
        onError: (e: any) => {
          toast.error(e?.message || "Failed to add customer");
          setLoading(false);
        },
      }
    );
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-5 mt-1">
      <div>
        <label htmlFor="customer-name" className="block text-[15px] font-medium text-gray-800 mb-1">Full Name</label>
        <Input
          id="customer-name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Enter customer's full name"
          required
        />
      </div>
      <div>
        <label htmlFor="customer-phone" className="block text-[15px] font-medium text-gray-800 mb-1">Phone Number</label>
        <PhoneInput
          id="customer-phone"
          value={form.phone}
          defaultCountry="LB"
          onChange={val => setForm(f => ({ ...f, phone: val || "" }))}
          placeholder="03 123 456"
          required
        />
      </div>
      {/* Secondary Phone Option */}
      {showSecondaryPhone ? (
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label htmlFor="customer-secondary-phone" className="block text-[15px] font-medium text-gray-800 mb-1">
              Secondary Phone <span className="ml-1 text-xs text-gray-400">(Optional)</span>
            </label>
            <PhoneInput
              id="customer-secondary-phone"
              value={form.secondary_phone}
              defaultCountry="LB"
              onChange={val => setForm(f => ({ ...f, secondary_phone: val || "" }))}
              placeholder="70 123 456"
            />
          </div>
          <Button type="button" variant="ghost" className="mt-6 text-xs px-2" onClick={() => setShowSecondaryPhone(false)}>
            Remove
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className="pl-0 text-[#db271e] underline text-sm hover:bg-transparent"
          onClick={() => setShowSecondaryPhone(true)}
        >
          + Add Secondary Phone
        </Button>
      )}
      {/* Area Selector */}
      <div>
        <label className="block text-[15px] font-medium text-gray-800 mb-1">Area (Governorate & City)</label>
        <AreaSelector
          selectedGovernorate={form.governorate}
          selectedArea={form.city}
          onAreaSelected={handleAreaSelected}
        />
      </div>
      {/* Address Details */}
      <div>
        <label htmlFor="customer-address" className="block text-[15px] font-medium text-gray-800 mb-1">Address Details</label>
        <Input
          id="customer-address"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="Building, street, landmark ..."
        />
      </div>
      <div className="flex items-center mt-1">
        <Checkbox
          id="is-work-address"
          checked={form.is_work_address}
          onCheckedChange={v => setForm(f => ({ ...f, is_work_address: !!v }))}
          className="mr-2"
        />
        <label htmlFor="is-work-address" className="text-gray-800 cursor-pointer">
          This is a work/business address
        </label>
      </div>
      <div className="flex mt-4">
        <Button type="submit" className="w-full bg-[#dc291e] text-white" disabled={loading}>
          {loading ? "Adding..." : "Add Customer"}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={v => { if (!v) resetForm(); onOpenChange(v); }} shouldScaleBackground>
        <DrawerContent className="rounded-t-2xl p-0 bg-background max-h-[96vh] overflow-y-auto">
          <DrawerHeader className="px-6 pb-0 pt-4">
            <DrawerTitle className="text-xl font-semibold">Add Customer</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pt-2 pb-2">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[470px] w-full rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-xl font-semibold">Add Customer</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-1">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
