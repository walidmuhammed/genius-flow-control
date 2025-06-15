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

  // ========== Apple-style swipe/drag handle for modal =============
  // We'll use a bigger, centered, touch-friendly handle bar always visible at the top
  const DrawerHandleBar = () => (
    <div className="w-full flex justify-center items-center py-2">
      <div className="w-12 h-2 rounded-full bg-gray-300" style={{ opacity: 0.9 }} />
    </div>
  );

  // ========== FIX: Remove justify-between & add grouped spacing =============
  // We'll group fields, avoid justify-between, space sections with gaps and dividers on mobile

  // ========== FIX: Clean footer sticky logic/height padding ============
  // Properly stick the footer, padding bottom so last input is never hidden

  const mobileStickyFooter = (
    <div
      className="fixed left-0 right-0 bottom-0 z-40 bg-white border-t px-4 py-3 flex items-center"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 12px), 12px)",
        boxShadow: "0px -2px 14px 0px rgba(0,0,0,0.06)"
      }}
    >
      <Button
        type="submit"
        className="w-full bg-[#dc291e] text-white text-base font-semibold py-3 rounded-xl"
        disabled={loading}
        style={{ height: 50 }}
        tabIndex={0}
      >
        {loading ? "Adding..." : "Add Customer"}
      </Button>
    </div>
  );

  // ========== FIX: Refined Mobile Form Layout ==============
  // Remove justified flex, group form fields, space with gaps

  const mobileFormFields = (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 mt-1"
      style={{ paddingBottom: 138, minHeight: "100%" }}
      autoComplete="off"
    >
      {/* Full Name */}
      <div>
        <label htmlFor="customer-name" className="block text-[15px] font-medium text-gray-800 mb-1">
          Full Name
        </label>
        <Input
          id="customer-name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Enter customer's full name"
          required
          autoComplete="off"
          className="text-base md:text-sm"
        />
      </div>

      {/* Phone(s) - grouped for visual clarity */}
      <div className="space-y-2">
        <div>
          <label htmlFor="customer-phone" className="block text-[15px] font-medium text-gray-800 mb-1">
            Phone Number
          </label>
          <PhoneInput
            id="customer-phone"
            value={form.phone}
            defaultCountry="LB"
            onChange={val => setForm(f => ({ ...f, phone: val || "" }))}
            placeholder="03 123 456"
            required
            inputClassName="text-base md:text-sm"
            autoComplete="off"
          />
        </div>
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
                inputClassName="text-base md:text-sm"
                autoComplete="off"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-6 text-xs px-2"
              onClick={() => setShowSecondaryPhone(false)}
              tabIndex={0}
            >
              Remove
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="pl-0 text-[#db271e] underline text-sm hover:bg-transparent"
            onClick={() => setShowSecondaryPhone(true)}
            tabIndex={0}
          >
            + Add Secondary Phone
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t my-4" />

      {/* Area Selector - visually grouped */}
      <div>
        <label className="block text-[15px] font-medium text-gray-800 mb-1">
          Area (Governorate & City)
        </label>
        <AreaSelector
          selectedGovernorate={form.governorate}
          selectedArea={form.city}
          onAreaSelected={handleAreaSelected}
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="customer-address" className="block text-[15px] font-medium text-gray-800 mb-1">
          Address Details
        </label>
        <Input
          id="customer-address"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="Building, street, landmark ..."
          className="text-base md:text-sm"
          autoComplete="off"
        />
      </div>

      {/* Work Checkbox - visually spaced, no negative margin */}
      <div className="flex items-center pt-1">
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
    </form>
  );


  // ========== Mobile Drawer Render ==============
  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={v => { if (!v) resetForm(); onOpenChange(v); }}
        shouldScaleBackground
      >
        <DrawerContent className="rounded-t-2xl p-0 bg-background flex flex-col h-dvh max-h-none overflow-hidden shadow-xl">
          <DrawerHandleBar />
          <DrawerHeader className="px-6 pb-0 pt-0">
            <DrawerTitle className="text-xl font-semibold">Add Customer</DrawerTitle>
          </DrawerHeader>
          <div
            className="flex-1 flex flex-col overflow-y-auto px-4 pt-2 min-h-0"
            style={{
              minHeight: "0px",
              maxHeight: "calc(100dvh - 48px)",
              marginBottom: 0 // prevent unintentional scroll gaps
            }}
          >
            {mobileFormFields}
          </div>
          {mobileStickyFooter}
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
        <div className="p-6 pt-1">
          <form onSubmit={handleSubmit} className="space-y-5 mt-1">
            <div>
              <label htmlFor="customer-name" className="block text-[15px] font-medium text-gray-800 mb-1">Full Name</label>
              <Input
                id="customer-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter customer's full name"
                required
                className="text-base md:text-sm" // force 16px on mobile to prevent zoom
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
                inputClassName="text-base md:text-sm" // force 16px on mobile for input
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
                    inputClassName="text-base md:text-sm"
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
                className="text-base md:text-sm"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
