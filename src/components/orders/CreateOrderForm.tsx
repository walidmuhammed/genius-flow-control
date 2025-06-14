
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneInput } from '@/components/ui/phone-input';
import { AreaSelector } from '@/components/orders/AreaSelector';
import { PackageGuidelinesModal } from '@/components/orders/PackageGuidelinesModal';
import { useScreenSize } from '@/hooks/useScreenSize';
import { OrderWithCustomer } from '@/services/orders';
import { CustomerWithLocation } from '@/services/customers';
import { cn } from '@/lib/utils';
import { Phone, MapPin, Package, AlertTriangle, Plus } from 'lucide-react';

interface CreateOrderFormProps {
  mode?: 'create' | 'edit';
  initialOrder?: OrderWithCustomer;
  initialCustomer?: CustomerWithLocation;
  onSave?: (formData: any, changeHistory?: any[]) => void;
  onCreateAnother?: (formData: any) => void;
}

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({
  mode = 'create',
  initialOrder,
  initialCustomer,
  onSave,
  onCreateAnother
}) => {
  const { isMobile } = useScreenSize();
  
  // Form state - initialize with existing order data if editing
  const [orderType, setOrderType] = useState<'shipment' | 'exchange'>(
    initialOrder?.type === 'Exchange' ? 'exchange' : 'shipment'
  );
  const [phone, setPhone] = useState<string>(initialCustomer?.phone || '+961');
  const [secondaryPhone, setSecondaryPhone] = useState<string>(initialCustomer?.secondary_phone || '');
  const [isSecondaryPhone, setIsSecondaryPhone] = useState<boolean>(!!initialCustomer?.secondary_phone);
  const [name, setName] = useState<string>(initialCustomer?.name || '');
  const [isWorkAddress, setIsWorkAddress] = useState<boolean>(initialCustomer?.is_work_address || false);
  const [packageType, setPackageType] = useState<'parcel' | 'document' | 'bulky'>(
    initialOrder?.package_type || 'parcel'
  );
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string>(
    initialCustomer?.governorate_id || ''
  );
  const [selectedCityId, setSelectedCityId] = useState<string>(
    initialCustomer?.city_id || ''
  );
  const [selectedGovernorateName, setSelectedGovernorateName] = useState<string>(
    initialCustomer?.governorate_name || ''
  );
  const [selectedCityName, setSelectedCityName] = useState<string>(
    initialCustomer?.city_name || ''
  );
  const [cashCollection, setCashCollection] = useState<boolean>(
    initialOrder?.cash_collection_enabled ?? true
  );
  const [usdAmount, setUsdAmount] = useState<string>(
    initialOrder?.cash_collection_usd?.toString() || ''
  );
  const [lbpAmount, setLbpAmount] = useState<string>(
    initialOrder?.cash_collection_lbp?.toString() || ''
  );
  const [address, setAddress] = useState<string>(initialCustomer?.address || '');
  const [description, setDescription] = useState<string>(initialOrder?.package_description || '');
  const [itemsCount, setItemsCount] = useState<number>(initialOrder?.items_count || 1);
  const [deliveryNotes, setDeliveryNotes] = useState<string>(initialOrder?.note || '');
  const [allowOpening, setAllowOpening] = useState<boolean>(initialOrder?.allow_opening || false);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState<boolean>(false);

  // Phone validation state
  const [phoneValid, setPhoneValid] = useState<boolean>(true);
  const [secondaryPhoneValid, setSecondaryPhoneValid] = useState<boolean>(true);

  // Form validation errors
  const [errors, setErrors] = useState<{
    phone?: string;
    secondaryPhone?: string;
    name?: string;
    area?: string;
    address?: string;
    usdAmount?: string;
    lbpAmount?: string;
  }>({});

  // Store original values for change tracking
  const [originalValues, setOriginalValues] = useState<any>({});

  useEffect(() => {
    if (mode === 'edit' && initialOrder && initialCustomer) {
      setOriginalValues({
        orderType: initialOrder.type === 'Exchange' ? 'exchange' : 'shipment',
        phone: initialCustomer.phone,
        secondaryPhone: initialCustomer.secondary_phone || '',
        name: initialCustomer.name,
        isWorkAddress: initialCustomer.is_work_address,
        packageType: initialOrder.package_type,
        selectedGovernorateId: initialCustomer.governorate_id,
        selectedCityId: initialCustomer.city_id,
        selectedGovernorateName: initialCustomer.governorate_name,
        selectedCityName: initialCustomer.city_name,
        cashCollection: initialOrder.cash_collection_enabled,
        usdAmount: initialOrder.cash_collection_usd?.toString() || '',
        lbpAmount: initialOrder.cash_collection_lbp?.toString() || '',
        address: initialCustomer.address,
        description: initialOrder.package_description,
        itemsCount: initialOrder.items_count,
        deliveryNotes: initialOrder.note,
        allowOpening: initialOrder.allow_opening
      });
    }
  }, [mode, initialOrder, initialCustomer]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!phoneValid) {
      newErrors.phone = 'Valid phone number is required';
    }
    if (isSecondaryPhone && !secondaryPhoneValid && secondaryPhone) {
      newErrors.secondaryPhone = 'Valid secondary phone number is required';
    }
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!selectedGovernorateId || !selectedCityId) {
      newErrors.area = 'Both governorate and area selection are required';
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (cashCollection) {
      if (Number(usdAmount) === 0 && Number(lbpAmount) === 0) {
        newErrors.usdAmount = 'At least one currency amount must be provided';
        newErrors.lbpAmount = 'At least one currency amount must be provided';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateChangeHistory = () => {
    const changes: any[] = [];
    const currentValues = {
      orderType,
      phone,
      secondaryPhone,
      name,
      isWorkAddress,
      packageType,
      selectedGovernorateId,
      selectedCityId,
      selectedGovernorateName,
      selectedCityName,
      cashCollection,
      usdAmount,
      lbpAmount,
      address,
      description,
      itemsCount,
      deliveryNotes,
      allowOpening
    };

    const fieldLabels: Record<string, string> = {
      orderType: 'Order Type',
      phone: 'Phone Number',
      secondaryPhone: 'Secondary Phone',
      name: 'Full Name',
      isWorkAddress: 'Work Address',
      packageType: 'Package Type',
      selectedGovernorateName: 'Governorate',
      selectedCityName: 'City',
      cashCollection: 'Cash Collection',
      usdAmount: 'USD Amount',
      lbpAmount: 'LBP Amount',
      address: 'Address',
      description: 'Package Description',
      itemsCount: 'Items Count',
      deliveryNotes: 'Delivery Notes',
      allowOpening: 'Allow Opening'
    };

    Object.keys(currentValues).forEach(key => {
      const original = originalValues[key];
      const current = currentValues[key as keyof typeof currentValues];
      
      if (original !== current && fieldLabels[key]) {
        changes.push({
          field: fieldLabels[key],
          from: original,
          to: current,
          timestamp: new Date().toISOString()
        });
      }
    });

    return changes;
  };

  const handleSubmit = (createAnother: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    const formData = {
      type: orderType === 'exchange' ? 'Exchange' : 'Deliver',
      package_type: packageType,
      package_description: description || undefined,
      items_count: itemsCount,
      allow_opening: allowOpening,
      cash_collection_enabled: cashCollection,
      cash_collection_usd: cashCollection ? Number(usdAmount) || 0 : 0,
      cash_collection_lbp: cashCollection ? Number(lbpAmount) || 0 : 0,
      delivery_fees_usd: 5,
      delivery_fees_lbp: 150000,
      note: deliveryNotes || undefined,
      status: 'New'
    };

    if (mode === 'edit') {
      const changeHistory = generateChangeHistory();
      onSave?.(formData, changeHistory);
    } else {
      if (createAnother) {
        onCreateAnother?.(formData);
      } else {
        onSave?.(formData);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column - Customer & Address (8/12 width) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={cn("text-sm font-medium", errors.phone ? "text-red-600" : "text-gray-700")}>
                    Phone Number
                  </Label>
                  <PhoneInput
                    id="phone"
                    value={phone}
                    onChange={setPhone}
                    defaultCountry="LB"
                    onValidationChange={setPhoneValid}
                    placeholder="Enter phone number"
                    className={cn("h-10", errors.phone ? "border-red-300" : "border-gray-300")}
                  />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className={cn("text-sm font-medium", errors.name ? "text-red-600" : "text-gray-700")}>
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter customer full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn("h-10", errors.name ? "border-red-300" : "border-gray-300")}
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>
              </div>
              
              {!isSecondaryPhone && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSecondaryPhone(true)}
                  className="text-xs h-8 mx-0 py-0 my-0"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add secondary phone
                </Button>
              )}

              {isSecondaryPhone && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="secondary-phone" className={cn("text-sm font-medium", errors.secondaryPhone ? "text-red-600" : "text-gray-700")}>
                      Secondary Phone
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsSecondaryPhone(false);
                        setSecondaryPhone('');
                      }}
                      className="text-xs h-6 px-2"
                    >
                      Remove
                    </Button>
                  </div>
                  <PhoneInput
                    id="secondary-phone"
                    value={secondaryPhone}
                    onChange={setSecondaryPhone}
                    defaultCountry="LB"
                    onValidationChange={setSecondaryPhoneValid}
                    placeholder="Enter secondary phone"
                    className={cn("h-10", errors.secondaryPhone ? "border-red-300" : "border-gray-300")}
                  />
                  {errors.secondaryPhone && <p className="text-xs text-red-600">{errors.secondaryPhone}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className={cn("text-sm font-medium", errors.area ? "text-red-600" : "text-gray-700")}>
                  Area (Governorate & City)
                </Label>
                <AreaSelector
                  selectedArea={selectedCityName}
                  selectedGovernorate={selectedGovernorateName}
                  onAreaSelected={(governorateName, cityName, governorateId, cityId) => {
                    if (governorateId) {
                      setSelectedGovernorateId(governorateId);
                      setSelectedGovernorateName(governorateName);
                    }
                    if (cityId) {
                      setSelectedCityId(cityId);
                      setSelectedCityName(cityName);
                    }
                  }}
                />
                {errors.area && <p className="text-xs text-red-600">{errors.area}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className={cn("text-sm font-medium", errors.address ? "text-red-600" : "text-gray-700")}>
                  Address Details
                </Label>
                <Input
                  id="address"
                  placeholder="Building, street, landmark..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={cn("h-10", errors.address ? "border-red-300" : "border-gray-300")}
                />
                {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="work-address"
                  checked={isWorkAddress}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setIsWorkAddress(checked);
                    }
                  }}
                  className="border-gray-300"
                />
                <Label htmlFor="work-address" className="text-sm text-gray-700 cursor-pointer">
                  This is a work/business address
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Package Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  Package Information
                </CardTitle>
                <Button
                  variant="link"
                  onClick={() => setGuidelinesModalOpen(true)}
                  className="text-xs text-blue-600 p-0 h-auto"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Guidelines
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Package Description
                    <span className="text-xs text-gray-500 ml-1">(Optional)</span>
                  </Label>
                  <Input
                    id="description"
                    placeholder="Electronics, clothes, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-10 border-gray-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="items-count" className="text-sm font-medium text-gray-700">
                    Number of Items
                  </Label>
                  <Input
                    id="items-count"
                    type="number"
                    min={1}
                    value={itemsCount}
                    onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                    className="h-10 border-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Order Details (4/12 width) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Type */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={orderType === 'shipment' ? "default" : "outline"}
                  onClick={() => setOrderType('shipment')}
                  className={cn("h-10 text-sm", orderType === 'shipment' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                >
                  Shipment
                </Button>
                <Button
                  variant={orderType === 'exchange' ? "default" : "outline"}
                  onClick={() => setOrderType('exchange')}
                  className={cn("h-10 text-sm", orderType === 'exchange' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                >
                  Exchange
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Cash Collection */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Cash Collection</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cash-collection"
                    checked={cashCollection}
                    onCheckedChange={(checked) => {
                      if (typeof checked === 'boolean') {
                        setCashCollection(checked);
                      }
                    }}
                    className="border-gray-300"
                  />
                </div>
              </div>
            </CardHeader>
            {cashCollection && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="usd-amount" className={cn("text-sm font-medium", errors.usdAmount ? "text-red-600" : "text-gray-700")}>
                      USD Amount
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 font-semibold text-sm pointer-events-none z-10">
                        $
                      </span>
                      <Input
                        id="usd-amount"
                        type="text"
                        value={usdAmount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const decimalParts = value.split('.');
                          if (decimalParts.length > 1) {
                            const wholeNumber = decimalParts[0];
                            const decimal = decimalParts.slice(1).join('').slice(0, 2);
                            setUsdAmount(`${wholeNumber}.${decimal}`);
                          } else {
                            setUsdAmount(value);
                          }
                        }}
                        className={cn("h-10 pl-8 bg-white", errors.usdAmount ? "border-red-300" : "border-gray-300")}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.usdAmount && <p className="text-xs text-red-600">{errors.usdAmount}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lbp-amount" className={cn("text-sm font-medium", errors.lbpAmount ? "text-red-600" : "text-gray-700")}>
                      LBP Amount
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 font-semibold text-xs pointer-events-none z-10">
                        LBP
                      </span>
                      <Input
                        id="lbp-amount"
                        type="text"
                        value={lbpAmount ? parseInt(lbpAmount).toLocaleString('en-US') : ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          setLbpAmount(rawValue);
                        }}
                        className={cn("h-10 pl-12 bg-white", errors.lbpAmount ? "border-red-300" : "border-gray-300")}
                        placeholder="0"
                      />
                    </div>
                    {errors.lbpAmount && <p className="text-xs text-red-600">{errors.lbpAmount}</p>}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Package Type */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Package Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={packageType === "parcel" ? "default" : "outline"}
                  onClick={() => setPackageType("parcel")}
                  className={cn("h-14 flex-col gap-1 text-xs", packageType === "parcel" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                >
                  <Package className="h-4 w-4" />
                  Parcel
                </Button>
                <Button
                  variant={packageType === "document" ? "default" : "outline"}
                  onClick={() => setPackageType("document")}
                  className={cn("h-14 flex-col gap-1 text-xs", packageType === "document" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                >
                  <Package className="h-4 w-4" />
                  Document
                </Button>
                <Button
                  variant={packageType === "bulky" ? "default" : "outline"}
                  onClick={() => setPackageType("bulky")}
                  className={cn("h-14 flex-col gap-1 text-xs", packageType === "bulky" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                >
                  <Package className="h-4 w-4" />
                  Bulky
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                <Checkbox
                  id="allow-opening"
                  checked={allowOpening}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      setAllowOpening(checked);
                    }
                  }}
                  className="border-gray-300"
                />
                <Label htmlFor="allow-opening" className="text-sm text-gray-700 cursor-pointer">
                  Allow package inspection
                </Label>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-notes" className="text-sm font-medium text-gray-700">
                  Delivery Notes <span className="text-xs text-gray-500">(Optional)</span>
                </Label>
                <Textarea
                  id="delivery-notes"
                  placeholder="Special delivery instructions..."
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="resize-none border-gray-300 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      {!isMobile && mode === 'create' && (
        <div className="flex items-center justify-between mt-8">
          <div></div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 text-sm"
            >
              Create & Add Another
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 text-sm bg-[#DC291E] hover:bg-[#c0211a]"
            >
              Create Order
            </Button>
          </div>
        </div>
      )}

      {!isMobile && mode === 'edit' && (
        <div className="flex items-center justify-center mt-8">
          <Button
            onClick={() => handleSubmit(false)}
            className="px-6 py-2 text-sm bg-[#DC291E] hover:bg-[#c0211a]"
          >
            Save Changes
          </Button>
        </div>
      )}

      {isMobile && (
        <div className="mt-8 space-y-3">
          <Button
            onClick={() => handleSubmit(false)}
            className="w-full py-3 bg-[#DC291E] hover:bg-[#c0211a]"
          >
            {mode === 'edit' ? 'Save Changes' : 'Create Order'}
          </Button>
          {mode === 'create' && (
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              className="w-full py-3 border-gray-300"
            >
              Create & Add Another
            </Button>
          )}
        </div>
      )}

      <PackageGuidelinesModal
        open={guidelinesModalOpen}
        onOpenChange={setGuidelinesModalOpen}
      />
    </>
  );
};

export default CreateOrderForm;
