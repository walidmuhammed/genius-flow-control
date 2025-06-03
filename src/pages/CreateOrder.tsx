
import React, { useState, useEffect, useRef } from 'react';
import { X, Info, Check, Plus, MapPin, Search, Phone, Package, FileText, ScrollText, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import { AreaSelector } from '@/components/orders/AreaSelector';
import { ImprovedCashCollectionFields } from '@/components/orders/ImprovedCashCollectionFields';
import { PackageGuidelinesModal } from '@/components/orders/PackageGuidelinesModal';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCity, useCitiesByGovernorate } from '@/hooks/use-cities';
import { useSearchCustomersByPhone, useCreateCustomer } from '@/hooks/use-customers';
import { useCreateOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerWithLocation } from '@/services/customers';
import { Order } from '@/services/orders';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import OrderTypeSelector from '@/components/dashboard/OrderTypeSelector';

// Create a unique form key for forcing re-render
const getUniqueFormKey = () => `order-form-${Date.now()}`;

const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [formKey, setFormKey] = useState(getUniqueFormKey());
  const initialRenderRef = useRef(true);

  // Form state
  const [orderType, setOrderType] = useState<'shipment' | 'exchange'>('shipment');
  const [phone, setPhone] = useState<string>('+961');
  const [secondaryPhone, setSecondaryPhone] = useState<string>('');
  const [isSecondaryPhone, setIsSecondaryPhone] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [isWorkAddress, setIsWorkAddress] = useState<boolean>(false);
  const [packageType, setPackageType] = useState<'parcel' | 'document' | 'bulky'>('parcel');
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedGovernorateName, setSelectedGovernorateName] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [cashCollection, setCashCollection] = useState<boolean>(true);
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [lbpAmount, setLbpAmount] = useState<string>('');
  const [phoneValid, setPhoneValid] = useState<boolean>(false);
  const [secondaryPhoneValid, setSecondaryPhoneValid] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [orderReference, setOrderReference] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [allowOpening, setAllowOpening] = useState<boolean>(false);
  const [existingCustomer, setExistingCustomer] = useState<CustomerWithLocation | null>(null);
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState<boolean>(false);

  // Delivery fees (calculated or fixed)
  const deliveryFees = {
    usd: 5,
    lbp: 150000
  };

  // Form validation
  const [errors, setErrors] = useState<{
    phone?: string;
    secondaryPhone?: string;
    name?: string;
    area?: string;
    address?: string;
    usdAmount?: string;
    lbpAmount?: string;
  }>({});

  // Supabase Integration - phone search only triggers when number is complete
  const {
    data: foundCustomers,
    isLoading: searchingCustomers,
    refetch: refetchCustomers
  } = useSearchCustomersByPhone(phone);

  const createCustomer = useCreateCustomer();
  const createOrder = useCreateOrder();

  // Clear any cached form data from localStorage
  const clearCachedFormData = () => {
    const formKeys = ['order-form-data', 'order-form-customer', 'order-form-phone', 'order-form-address', 'order-form-governorate', 'order-form-city'];
    formKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  const resetForm = () => {
    setOrderType('shipment');
    setPhone('+961');
    setSecondaryPhone('');
    setIsSecondaryPhone(false);
    setName('');
    setIsWorkAddress(false);
    setPackageType('parcel');
    setSelectedGovernorateId('');
    setSelectedCityId('');
    setSelectedGovernorateName('');
    setSelectedCityName('');
    setCashCollection(true);
    setUsdAmount('');
    setLbpAmount('');
    setAddress('');
    setDescription('');
    setItemsCount(1);
    setOrderReference('');
    setDeliveryNotes('');
    setAllowOpening(false);
    setExistingCustomer(null);
    setErrors({});

    clearCachedFormData();

    queryClient.removeQueries({
      queryKey: ['customers', 'search']
    });

    setFormKey(getUniqueFormKey());
  };

  useEffect(() => {
    resetForm();

    return () => {
      clearCachedFormData();
      queryClient.removeQueries({
        queryKey: ['customers', 'search']
      });
    };
  }, [location.pathname, queryClient]);

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    if (foundCustomers && foundCustomers.length > 0) {
      const customer = foundCustomers[0];
      setExistingCustomer(customer);
      setName(customer.name);
      setAddress(customer.address || '');
      setIsWorkAddress(customer.is_work_address);
      if (customer.governorate_id && customer.city_id) {
        setSelectedGovernorateId(customer.governorate_id);
        setSelectedCityId(customer.city_id);
        if (customer.governorate_name) {
          setSelectedGovernorateName(customer.governorate_name);
        }
        if (customer.city_name) {
          setSelectedCityName(customer.city_name);
        }
      }
      if (customer.secondary_phone) {
        setSecondaryPhone(customer.secondary_phone);
        setIsSecondaryPhone(true);
      }
      toast.info("Customer information auto-filled");
    } else if (phone.replace(/\D/g, '').length >= 11 && !searchingCustomers) {
      setExistingCustomer(null);
    }
  }, [foundCustomers, searchingCustomers, phone]);

  const validateForm = () => {
    const newErrors: {
      phone?: string;
      secondaryPhone?: string;
      name?: string;
      area?: string;
      address?: string;
      usdAmount?: string;
      lbpAmount?: string;
    } = {};
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

  const handleSubmit = async (createAnother: boolean = false) => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    try {
      let customerId = existingCustomer?.id;

      const fullAddressData = {
        address,
        city_id: selectedCityId || null,
        governorate_id: selectedGovernorateId || null,
        is_work_address: isWorkAddress
      };
      if (!customerId) {
        const customerData = {
          name,
          phone,
          secondary_phone: isSecondaryPhone ? secondaryPhone : undefined,
          ...fullAddressData
        };
        const newCustomer = await createCustomer.mutateAsync(customerData);
        customerId = newCustomer.id;
      } else if (existingCustomer) {
        const hasAddressChanged = existingCustomer.address !== address || existingCustomer.city_id !== selectedCityId || existingCustomer.governorate_id !== selectedGovernorateId || existingCustomer.is_work_address !== isWorkAddress;
        if (hasAddressChanged) {
          console.log("Address data changed, customer profile would be updated");
        }
      }

      const orderData: Omit<Order, 'id' | 'order_id' | 'reference_number' | 'created_at' | 'updated_at'> = {
        type: orderType === 'exchange' ? 'Exchange' : 'Deliver',
        customer_id: customerId,
        package_type: packageType,
        package_description: description || undefined,
        items_count: itemsCount,
        allow_opening: allowOpening,
        cash_collection_enabled: cashCollection,
        cash_collection_usd: cashCollection ? Number(usdAmount) || 0 : 0,
        cash_collection_lbp: cashCollection ? Number(lbpAmount) || 0 : 0,
        delivery_fees_usd: deliveryFees.usd,
        delivery_fees_lbp: deliveryFees.lbp,
        note: deliveryNotes || undefined,
        status: 'New',
        ...(orderReference.trim() && {
          reference_number: orderReference.trim()
        })
      };
      await createOrder.mutateAsync(orderData);
      if (createAnother) {
        resetForm();
        toast.success("Order created successfully. Create another one.");
      } else {
        toast.success("Order created successfully.");
        navigate('/orders');
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create the order. Please try again.");
    }
  };

  const handleGovernorateChange = (governorateId: string, governorateName: string) => {
    setSelectedGovernorateId(governorateId);
    setSelectedGovernorateName(governorateName);
    setSelectedCityId('');
    setSelectedCityName('');

    if (errors.area) {
      setErrors(prev => ({
        ...prev,
        area: undefined
      }));
    }
  };

  const handleCityChange = (cityId: string, cityName: string, governorateName: string) => {
    setSelectedCityId(cityId);
    setSelectedCityName(cityName);

    if (errors.area) {
      setErrors(prev => ({
        ...prev,
        area: undefined
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);

    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: undefined
      }));
    }
  };

  return (
    <MainLayout className="bg-gray-50/50">
      <div className="min-h-screen" key={formKey}>
        {/* Modern Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Order</h1>
                <p className="text-sm text-gray-500 mt-0.5">Complete the form to create a delivery order</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  className="h-9 px-4 text-sm font-medium border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Create & Add Another
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  className="h-9 px-6 text-sm font-medium bg-[#DC291E] hover:bg-[#c0211a] transition-colors"
                >
                  Create Order
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Order Type */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Order Type</h3>
                <div className="flex space-x-3">
                  <Button
                    variant={orderType === 'shipment' ? "default" : "outline"}
                    onClick={() => setOrderType('shipment')}
                    className={cn(
                      "flex-1 h-10 font-medium transition-all",
                      orderType === 'shipment'
                        ? "bg-[#DC291E] hover:bg-[#c0211a] text-white"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    Shipment
                  </Button>
                  <Button
                    variant={orderType === 'exchange' ? "default" : "outline"}
                    onClick={() => setOrderType('exchange')}
                    className={cn(
                      "flex-1 h-10 font-medium transition-all",
                      orderType === 'exchange'
                        ? "bg-[#DC291E] hover:bg-[#c0211a] text-white"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    Exchange
                  </Button>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-5">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <h3 className="text-base font-semibold text-gray-900">Customer Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className={cn("text-sm font-medium", errors.phone ? "text-red-600" : "text-gray-700")}>
                      Phone Number
                    </Label>
                    <PhoneInput
                      id="phone"
                      value={phone}
                      onChange={handlePhoneChange}
                      defaultCountry="LB"
                      onValidationChange={setPhoneValid}
                      placeholder="Enter phone number"
                      className={cn("h-10", errors.phone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#DC291E]")}
                      errorMessage={errors.phone}
                    />
                    {searchingCustomers && (
                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Searching for existing customer...
                      </p>
                    )}
                    {existingCustomer && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Existing customer found!
                      </p>
                    )}
                  </div>
                  
                  {/* Customer Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className={cn("text-sm font-medium", errors.name ? "text-red-600" : "text-gray-700")}>
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter customer full name"
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        if (errors.name) {
                          setErrors(prev => ({ ...prev, name: undefined }));
                        }
                      }}
                      className={cn("h-10", errors.name ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#DC291E]")}
                    />
                    {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                  </div>
                </div>

                {/* Secondary Phone */}
                {!isSecondaryPhone ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSecondaryPhone(true)}
                    className="text-sm text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <Plus className="h-3 w-3 mr-1.5" />
                    Add secondary phone
                  </Button>
                ) : (
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
                          if (errors.secondaryPhone) {
                            setErrors(prev => ({ ...prev, secondaryPhone: undefined }));
                          }
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 h-auto p-1"
                      >
                        Remove
                      </Button>
                    </div>
                    <PhoneInput
                      id="secondary-phone"
                      value={secondaryPhone}
                      onChange={value => {
                        setSecondaryPhone(value);
                        if (errors.secondaryPhone) {
                          setErrors(prev => ({ ...prev, secondaryPhone: undefined }));
                        }
                      }}
                      defaultCountry="LB"
                      onValidationChange={setSecondaryPhoneValid}
                      placeholder="Enter secondary phone"
                      className={cn("h-10", errors.secondaryPhone ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#DC291E]")}
                      errorMessage={errors.secondaryPhone}
                    />
                  </div>
                )}
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-5">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <h3 className="text-base font-semibold text-gray-900">Address Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Area Selection */}
                  <div className="space-y-2">
                    <Label className={cn("text-sm font-medium", errors.area ? "text-red-600" : "text-gray-700")}>
                      Area (Governorate & City)
                    </Label>
                    <AreaSelector
                      selectedArea={selectedCityName}
                      selectedGovernorate={selectedGovernorateName}
                      onAreaSelected={(governorateName, cityName, governorateId, cityId) => {
                        if (governorateId) handleGovernorateChange(governorateId, governorateName);
                        if (cityId) handleCityChange(cityId, cityName, governorateName);
                      }}
                    />
                    {errors.area && <p className="text-xs text-red-600">{errors.area}</p>}
                  </div>
                  
                  {/* Address Details */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className={cn("text-sm font-medium", errors.address ? "text-red-600" : "text-gray-700")}>
                      Address Details
                    </Label>
                    <Input
                      id="address"
                      placeholder="Building, street, landmark..."
                      value={address}
                      onChange={e => {
                        setAddress(e.target.value);
                        if (errors.address) {
                          setErrors(prev => ({ ...prev, address: undefined }));
                        }
                      }}
                      className={cn("h-10", errors.address ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-[#DC291E]")}
                    />
                    {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                  </div>
                </div>
                
                {/* Work Address Checkbox */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="work-address"
                    checked={isWorkAddress}
                    onCheckedChange={checked => {
                      if (typeof checked === 'boolean') {
                        setIsWorkAddress(checked);
                      }
                    }}
                    className="border-gray-300"
                  />
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="work-address" className="text-sm font-medium text-gray-700 cursor-pointer">
                      This is a work/business address
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark if delivery is to a business location</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-5">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-reference" className="text-sm font-medium text-gray-700">
                      Order Reference
                      <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
                    </Label>
                    <Input
                      id="order-reference"
                      placeholder="Your tracking reference"
                      value={orderReference}
                      onChange={e => setOrderReference(e.target.value)}
                      className="h-10 border-gray-200 focus:border-[#DC291E]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery-notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <ScrollText className="h-4 w-4 text-gray-500" />
                      Delivery Notes
                      <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="delivery-notes"
                      placeholder="Special delivery instructions..."
                      rows={2}
                      value={deliveryNotes}
                      onChange={e => setDeliveryNotes(e.target.value)}
                      className="resize-none border-gray-200 focus:border-[#DC291E]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Secondary Form Elements */}
            <div className="space-y-6">
              
              {/* Cash Collection */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <ImprovedCashCollectionFields
                  enabled={cashCollection}
                  onEnabledChange={setCashCollection}
                  usdAmount={usdAmount}
                  lbpAmount={lbpAmount}
                  onUsdAmountChange={value => {
                    setUsdAmount(value);
                    if (errors.usdAmount || errors.lbpAmount) {
                      setErrors(prev => ({
                        ...prev,
                        usdAmount: undefined,
                        lbpAmount: undefined
                      }));
                    }
                  }}
                  onLbpAmountChange={value => {
                    setLbpAmount(value);
                    if (errors.usdAmount || errors.lbpAmount) {
                      setErrors(prev => ({
                        ...prev,
                        usdAmount: undefined,
                        lbpAmount: undefined
                      }));
                    }
                  }}
                  deliveryFees={deliveryFees}
                  errors={{
                    usdAmount: errors.usdAmount,
                    lbpAmount: errors.lbpAmount
                  }}
                />
              </div>

              {/* Package Information */}
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <h3 className="text-base font-semibold text-gray-900">Package Information</h3>
                  </div>
                  <Button
                    variant="link"
                    onClick={() => setGuidelinesModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    Guidelines
                  </Button>
                </div>
                
                {/* Package Type */}
                <div className="space-y-3 mb-4">
                  <Label className="text-sm font-medium text-gray-700">Package Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={packageType === "parcel" ? "default" : "outline"}
                      onClick={() => setPackageType("parcel")}
                      className={cn(
                        "h-14 flex-col gap-1 text-xs font-medium transition-all",
                        packageType === "parcel"
                          ? "bg-[#DC291E] hover:bg-[#c0211a] text-white"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <Package className="h-4 w-4" />
                      Parcel
                    </Button>
                    <Button
                      variant={packageType === "document" ? "default" : "outline"}
                      onClick={() => setPackageType("document")}
                      className={cn(
                        "h-14 flex-col gap-1 text-xs font-medium transition-all",
                        packageType === "document"
                          ? "bg-[#DC291E] hover:bg-[#c0211a] text-white"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      Document
                    </Button>
                    <Button
                      variant={packageType === "bulky" ? "default" : "outline"}
                      onClick={() => setPackageType("bulky")}
                      className={cn(
                        "h-14 flex-col gap-1 text-xs font-medium transition-all",
                        packageType === "bulky"
                          ? "bg-[#DC291E] hover:bg-[#c0211a] text-white"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      <Package className="h-4 w-4" />
                      Bulky
                    </Button>
                  </div>
                </div>

                {/* Items Count */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="items-count" className="text-sm font-medium text-gray-700">
                    Number of Items
                  </Label>
                  <Input
                    id="items-count"
                    type="number"
                    min={1}
                    value={itemsCount}
                    onChange={e => setItemsCount(parseInt(e.target.value) || 1)}
                    className="h-10 border-gray-200 focus:border-[#DC291E]"
                  />
                </div>

                {/* Package Description */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Package Description
                    <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g., Electronics - Phone case"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="h-10 border-gray-200 focus:border-[#DC291E]"
                  />
                  <p className="text-xs text-gray-500">
                    Brief description helps with handling
                  </p>
                </div>
                
                {/* Allow Opening Checkbox */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                  <Checkbox
                    id="allow-opening"
                    checked={allowOpening}
                    onCheckedChange={checked => {
                      if (typeof checked === 'boolean') {
                        setAllowOpening(checked);
                      }
                    }}
                    className="border-gray-300"
                  />
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="allow-opening" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Allow package inspection
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Allow customers to inspect contents before accepting</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons for Mobile */}
              <div className="flex flex-col space-y-3 lg:hidden">
                <Button
                  onClick={() => handleSubmit(false)}
                  className="h-11 font-medium bg-[#DC291E] hover:bg-[#c0211a] transition-colors"
                >
                  Create Order
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  className="h-11 font-medium border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Create & Add Another
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Package Guidelines Modal */}
      <PackageGuidelinesModal open={guidelinesModalOpen} onOpenChange={setGuidelinesModalOpen} />
    </MainLayout>
  );
};

export default CreateOrder;
