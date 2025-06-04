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

  // Mutations
  const createCustomer = useCreateCustomer();
  const createOrder = useCreateOrder();

  // Clear any cached form data from localStorage
  const clearCachedFormData = () => {
    // Clear any form-related items from localStorage
    const formKeys = ['order-form-data', 'order-form-customer', 'order-form-phone', 'order-form-address', 'order-form-governorate', 'order-form-city'];
    formKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // Reset form function
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

    // Clear any cached form data
    clearCachedFormData();

    // Clear React Query cache for customer search
    queryClient.removeQueries({
      queryKey: ['customers', 'search']
    });

    // Force re-render the form with a new key
    setFormKey(getUniqueFormKey());
  };

  // Reset form on component mount, navigation and path changes
  useEffect(() => {
    // Reset the form when the component mounts
    resetForm();

    // Clean up function to ensure form is reset when component unmounts
    return () => {
      clearCachedFormData();
      queryClient.removeQueries({
        queryKey: ['customers', 'search']
      });
    };
  }, [location.pathname, queryClient]); // Re-run when the path changes

  // Watch for customer search results - auto-fill customer info only when we have exact match
  useEffect(() => {
    // Skip during initial render to prevent autofill from cached query results
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
      // Only clear existing customer if we have a complete number and no matches
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
      // First ensure we have a customer
      let customerId = existingCustomer?.id;

      // Prepare full address data (city, governorate and details)
      const fullAddressData = {
        address,
        city_id: selectedCityId || null,
        governorate_id: selectedGovernorateId || null,
        is_work_address: isWorkAddress
      };
      if (!customerId) {
        // Create a new customer
        const customerData = {
          name,
          phone,
          secondary_phone: isSecondaryPhone ? secondaryPhone : undefined,
          ...fullAddressData
        };
        const newCustomer = await createCustomer.mutateAsync(customerData);
        customerId = newCustomer.id;
      } else if (existingCustomer) {
        // If address data changed for existing customer, update their profile
        const hasAddressChanged = existingCustomer.address !== address || existingCustomer.city_id !== selectedCityId || existingCustomer.governorate_id !== selectedGovernorateId || existingCustomer.is_work_address !== isWorkAddress;
        if (hasAddressChanged) {
          // In a real app, we would update the customer's address info here
          console.log("Address data changed, customer profile would be updated");
        }
      }

      // Then create the order with proper reference number handling
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
        // Only include reference_number if the user actually entered one
        ...(orderReference.trim() && { reference_number: orderReference.trim() })
      };
      
      await createOrder.mutateAsync(orderData);
      if (createAnother) {
        // Reset form for creating another order
        resetForm();
        toast.success("Order created successfully. Create another one.");
      } else {
        // Navigate back to orders list
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

    // Clear area error if it exists
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

    // Clear area error if it exists
    if (errors.area) {
      setErrors(prev => ({
        ...prev,
        area: undefined
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);

    // Clear phone error if it exists
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: undefined
      }));
    }
  };

  return (
    <MainLayout className="bg-gray-50/30">
      <div className="min-h-screen" key={formKey}>
        {/* Compact Page Container */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          {/* Integrated Header with Actions */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg border border-gray-200 px-6 py-4 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create New Order</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fill in the details to create a new delivery order</p>
            </div>
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

          {/* Compressed Main Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Customer & Address (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Customer Information - Compressed */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Phone and Name Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className={cn("h-9", errors.phone ? "border-red-300" : "border-gray-300")} 
                        errorMessage={errors.phone} 
                      />
                      {searchingCustomers && (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          Searching...
                        </p>
                      )}
                      {existingCustomer && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Customer found!
                        </p>
                      )}
                    </div>
                    
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
                        className={cn("h-9", errors.name ? "border-red-300" : "border-gray-300")} 
                      />
                      {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                    </div>
                  </div>
                  
                  {/* Secondary Phone */}
                  {!isSecondaryPhone && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsSecondaryPhone(true)}
                      className="text-xs h-8"
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
                            if (errors.secondaryPhone) {
                              setErrors(prev => ({ ...prev, secondaryPhone: undefined }));
                            }
                          }}
                          className="text-xs h-6 px-2"
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
                        className={cn("h-9", errors.secondaryPhone ? "border-red-300" : "border-gray-300")} 
                        errorMessage={errors.secondaryPhone} 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information - Compressed */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      className={cn("h-9", errors.address ? "border-red-300" : "border-gray-300")} 
                    />
                    {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
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
                    <Label htmlFor="work-address" className="text-sm text-gray-700 cursor-pointer">
                      This is a work/business address
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Package Information - Compressed */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-600" />
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
                  {/* Description and Items Count Side by Side */}
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
                        onChange={e => setDescription(e.target.value)} 
                        className="h-9 border-gray-300"
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
                        onChange={e => setItemsCount(parseInt(e.target.value) || 1)} 
                        className="h-9 border-gray-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Order Details (1/3 width) */}
            <div className="space-y-6">
              
              {/* Order Type */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Order Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={orderType === 'shipment' ? "default" : "outline"} 
                      onClick={() => setOrderType('shipment')}
                      className={cn("h-9 text-sm", orderType === 'shipment' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                    >
                      Shipment
                    </Button>
                    <Button 
                      variant={orderType === 'exchange' ? "default" : "outline"} 
                      onClick={() => setOrderType('exchange')}
                      className={cn("h-9 text-sm", orderType === 'exchange' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                    >
                      Exchange
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Cash Collection - Compressed */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-0">
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
                </CardContent>
              </Card>

              {/* Package Type */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Package Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={packageType === "parcel" ? "default" : "outline"} 
                      onClick={() => setPackageType("parcel")}
                      className={cn("h-12 flex-col gap-1 text-xs", packageType === "parcel" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                    >
                      <Package className="h-3 w-3" />
                      Parcel
                    </Button>
                    <Button 
                      variant={packageType === "document" ? "default" : "outline"} 
                      onClick={() => setPackageType("document")}
                      className={cn("h-12 flex-col gap-1 text-xs", packageType === "document" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                    >
                      <FileText className="h-3 w-3" />
                      Document
                    </Button>
                    <Button 
                      variant={packageType === "bulky" ? "default" : "outline"} 
                      onClick={() => setPackageType("bulky")}
                      className={cn("h-12 flex-col gap-1 text-xs", packageType === "bulky" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}
                    >
                      <Package className="h-3 w-3" />
                      Bulky
                    </Button>
                  </div>
                  
                  {/* Allow Opening Checkbox */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
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
                    <Label htmlFor="allow-opening" className="text-sm text-gray-700 cursor-pointer">
                      Allow package inspection
                    </Label>
                  </div>
                </CardContent>
              </Card>
              
              {/* Additional Information */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-reference" className="text-sm font-medium text-gray-700">
                      Order Reference <span className="text-xs text-gray-500">(Optional)</span>
                    </Label>
                    <Input 
                      id="order-reference" 
                      placeholder="Your tracking reference" 
                      value={orderReference} 
                      onChange={e => setOrderReference(e.target.value)} 
                      className="h-9 border-gray-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery-notes" className="text-sm font-medium text-gray-700">
                      Delivery Notes <span className="text-xs text-gray-500">(Optional)</span>
                    </Label>
                    <Textarea 
                      id="delivery-notes" 
                      placeholder="Special delivery instructions..." 
                      rows={3} 
                      value={deliveryNotes} 
                      onChange={e => setDeliveryNotes(e.target.value)} 
                      className="resize-none border-gray-300 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Action Buttons - Sticky Bottom */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handleSubmit(false)}
                className="w-full py-3 bg-[#DC291E] hover:bg-[#c0211a]"
              >
                Create Order
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSubmit(true)}
                className="w-full py-3 border-gray-300"
              >
                Create & Add Another
              </Button>
            </div>
          </div>

          {/* Mobile Bottom Padding */}
          <div className="lg:hidden h-32"></div>
        </div>
      </div>
      
      {/* Package Guidelines Modal */}
      <PackageGuidelinesModal open={guidelinesModalOpen} onOpenChange={setGuidelinesModalOpen} />
    </MainLayout>
  );
};

export default CreateOrder;
