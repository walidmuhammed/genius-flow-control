import React, { useState, useRef } from "react";
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
import { Plus, Trash2 } from "lucide-react";

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

  const formRef = useRef<HTMLFormElement | null>(null);

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

  // Modernize sticky mobile footer
  const mobileStickyFooter = (
    <div
      className="fixed left-0 right-0 bottom-0 z-40 bg-white/95 border-t border-gray-200 px-4 py-4 flex items-center shadow-lg"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 18px), 18px)"
      }}
    >
      <Button
        type="button"
        className="w-full bg-[#dc291e] text-base font-semibold py-3 rounded-xl shadow-sm transition shadow-[#dc291e]/10"
        disabled={loading}
        tabIndex={0}
        onClick={() => {
          if (formRef.current) {
            formRef.current.requestSubmit();
          }
        }}
      >
        {loading ? "Adding..." : "Add Customer"}
      </Button>
    </div>
  );

  // Improved styles: rounded soft section, subtle modern divider, vertical space

  // The Remove Secondary Phone Button (icon-only, tightly aligned)
  const RemoveSecondaryPhoneButton = (
    <button
      type="button"
      aria-label="Remove secondary phone"
      className={`
        absolute right-0 top-0
        bg-white text-gray-500 border border-gray-200 rounded-full
        p-1 mt-0.5 mr-0
        transition hover:bg-red-50 hover:text-red-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100
        w-6 h-6 flex items-center justify-center
      `}
      style={{
        // Ensures it hugs the upper right edge of label/input container
        zIndex: 10
      }}
      onClick={() => setShowSecondaryPhone(false)}
      tabIndex={0}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );

  // "+ Add Secondary Phone" modern button
  const AddSecondaryPhoneButton = (
    <Button
      type="button"
      variant="secondary"
      className="w-full sm:w-auto mt-1 bg-white border border-gray-200 text-[#dc291e] flex gap-2 items-center justify-center font-medium hover:bg-gray-100 transition"
      onClick={() => setShowSecondaryPhone(true)}
      tabIndex={0}
    >
      <Plus className="h-4 w-4" />
      Add Secondary Phone
    </Button>
  );

  // Modernized Checkbox styling
  const ModernCheckbox: React.FC<{
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    id?: string;
    label?: string;
  }> = ({ checked, onCheckedChange, id, label }) => (
    <label className="flex items-center cursor-pointer gap-2 select-none">
      <span
        className={`
          relative inline-flex h-5 w-10 flex-shrink-0 rounded-full transition-colors bg-gray-200
          ${checked ? "bg-[#dc291e]/70" : ""}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 bg-white rounded-full shadow transition-transform duration-200
            ${checked ? "translate-x-5" : ""}
          `}
        />
        <input
          type="checkbox"
          className="appearance-none w-0 h-0 absolute"
          checked={checked}
          id={id}
          onChange={e => onCheckedChange(e.target.checked)}
        />
      </span>
      {label && (
        <span className="text-gray-800 text-[15px]">{label}</span>
      )}
    </label>
  );

  const mobileFormFields = (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 mt-1"
      style={{ paddingBottom: 138, minHeight: "100%" }}
      autoComplete="off"
    >
      <h2 className="text-[1.42rem] font-bold text-gray-900 mb-2 tracking-tight">Add Customer</h2>
      <div>
        <label htmlFor="customer-name" className="block text-[15px] text-gray-700 font-semibold mb-2">
          Full Name
        </label>
        <Input
          id="customer-name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Enter customer's full name"
          required
          autoComplete="off"
          className="text-base md:text-sm bg-white"
        />
      </div>
      {/* Phone (and Secondary Phone), no container for secondary */}
      <div className="space-y-2 relative">
        <div>
          <label htmlFor="customer-phone" className="block text-[15px] text-gray-700 font-semibold mb-2">
            Phone Number
          </label>
          <PhoneInput
            id="customer-phone"
            value={form.phone}
            defaultCountry="LB"
            onChange={val => setForm(f => ({ ...f, phone: val || "" }))}
            placeholder="03 123 456"
            required
            inputClassName="text-base md:text-sm bg-white"
            autoComplete="off"
          />
        </div>
        {showSecondaryPhone ? (
          <div className="relative">
            <label
              htmlFor="customer-secondary-phone"
              className="block text-[15px] text-gray-700 font-medium mb-2"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span>
                Secondary Phone <span className="ml-1 text-xs text-gray-400">(Optional)</span>
              </span>
            </label>
            <div className="relative">
              <PhoneInput
                id="customer-secondary-phone"
                value={form.secondary_phone}
                defaultCountry="LB"
                onChange={val => setForm(f => ({ ...f, secondary_phone: val || "" }))}
                placeholder="70 123 456"
                inputClassName="text-base md:text-sm bg-white pr-10"
              />
              {/* Remove button aligned with the end of the input */}
              <button
                type="button"
                aria-label="Remove secondary phone"
                className={`
                  absolute top-1/2 -translate-y-1/2 right-2
                  bg-white text-gray-500 border border-gray-200 rounded-full
                  p-1 transition hover:bg-red-50 hover:text-red-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100
                  w-6 h-6 flex items-center justify-center z-20
                `}
                onClick={() => setShowSecondaryPhone(false)}
                tabIndex={0}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1">{AddSecondaryPhoneButton}</div>
        )}
      </div>

      {/* Area/Address fields now align with layout, no visual container */}
      <div>
        <label className="block text-[15px] text-gray-700 font-semibold mb-2">
          Area (Governorate & City)
        </label>
        <AreaSelector
          selectedGovernorate={form.governorate}
          selectedArea={form.city}
          onAreaSelected={handleAreaSelected}
        />
      </div>
      <div>
        <label htmlFor="customer-address" className="block text-[15px] text-gray-700 font-semibold mb-2">
          Address Details
        </label>
        <Input
          id="customer-address"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="Building, street, landmark ..."
          className="text-base md:text-sm bg-white"
          autoComplete="off"
        />
      </div>
      {/* Work address switch */}
      <div className="pt-1">
        <ModernCheckbox
          checked={form.is_work_address}
          onCheckedChange={v => setForm(f => ({ ...f, is_work_address: !!v }))}
          id="is-work-address"
          label="This is a work/business address"
        />
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={v => { if (!v) resetForm(); onOpenChange(v); }}
        shouldScaleBackground
      >
        <DrawerContent className="rounded-t-2xl p-0 bg-background flex flex-col h-dvh max-h-none overflow-hidden shadow-xl">
          <div className="w-full flex justify-center items-center py-2">
            <div className="w-12 h-2 rounded-full bg-gray-300 opacity-90" />
          </div>
          <DrawerHeader className="px-6 pb-0 pt-0">
            <DrawerTitle className="text-xl font-semibold"></DrawerTitle>
          </DrawerHeader>
          <div
            className="flex-1 flex flex-col overflow-y-auto px-4 pt-2 min-h-0"
            style={{
              minHeight: "0px",
              maxHeight: "calc(100dvh - 48px)",
              marginBottom: 0
            }}
          >
            {mobileFormFields}
          </div>
          {mobileStickyFooter}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop version
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[440px] w-full rounded-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-2 border-b bg-white">
          <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900">
            Add Customer
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-7 mt-1">
            <div>
              <label htmlFor="customer-name" className="block text-[15px] text-gray-700 font-semibold mb-2">Full Name</label>
              <Input
                id="customer-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter customer's full name"
                required
                className="text-base md:text-sm bg-white"
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-[15px] text-gray-700 font-semibold mb-2">Phone Number</label>
              <PhoneInput
                id="customer-phone"
                value={form.phone}
                defaultCountry="LB"
                onChange={val => setForm(f => ({ ...f, phone: val || "" }))}
                placeholder="03 123 456"
                required
                inputClassName="text-base md:text-sm bg-white"
              />
            </div>
            {/* Secondary Phone Option, no extra container */}
            {showSecondaryPhone ? (
              <div>
                <label
                  htmlFor="customer-secondary-phone"
                  className="block text-[15px] text-gray-700 font-medium mb-2"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span>
                    Secondary Phone <span className="ml-1 text-xs text-gray-400">(Optional)</span>
                  </span>
                </label>
                <div className="relative">
                  <PhoneInput
                    id="customer-secondary-phone"
                    value={form.secondary_phone}
                    defaultCountry="LB"
                    onChange={val => setForm(f => ({ ...f, secondary_phone: val || "" }))}
                    placeholder="70 123 456"
                    inputClassName="text-base md:text-sm bg-white pr-10"
                  />
                  {/* Remove button aligned with the end of the input */}
                  <button
                    type="button"
                    aria-label="Remove secondary phone"
                    className={`
                      absolute top-1/2 -translate-y-1/2 right-2
                      bg-white text-gray-500 border border-gray-200 rounded-full
                      p-1 transition hover:bg-red-50 hover:text-red-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100
                      w-6 h-6 flex items-center justify-center z-20
                    `}
                    onClick={() => setShowSecondaryPhone(false)}
                    tabIndex={0}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1">{AddSecondaryPhoneButton}</div>
            )}
            {/* Area selector, now aligned */}
            <div>
              <label className="block text-[15px] text-gray-700 font-semibold mb-2">Area (Governorate & City)</label>
              <AreaSelector
                selectedGovernorate={form.governorate}
                selectedArea={form.city}
                onAreaSelected={handleAreaSelected}
              />
            </div>
            <div>
              <label htmlFor="customer-address" className="block text-[15px] text-gray-700 font-semibold mb-2">
                Address Details
              </label>
              <Input
                id="customer-address"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Building, street, landmark ..."
                className="text-base md:text-sm bg-white"
              />
            </div>
            <div className="pt-1">
              <ModernCheckbox
                checked={form.is_work_address}
                onCheckedChange={v => setForm(f => ({ ...f, is_work_address: !!v }))}
                id="is-work-address"
                label="This is a work/business address"
              />
            </div>
            <div className="flex mt-6">
              <Button type="submit" className="w-full bg-[#dc291e] text-base font-semibold py-3 rounded-xl shadow transition shadow-[#dc291e]/10" disabled={loading}>
                {loading ? "Adding..." : "Add Customer"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// REMINDER: This file is getting too long (near 400 lines).
// You should consider asking me to refactor it into smaller, more maintainable files.
