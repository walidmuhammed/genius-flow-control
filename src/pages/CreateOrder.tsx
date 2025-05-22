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
  const [searchEnabled, setSearchEnabled] = useState<boolean>(false);

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

  // Supabase Integration
  const {
    data: governorates
  } = useGovernorates();
  const {
    data: cities
  } = useCitiesByGovernorate(selectedGovernorateId);
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
    setSearchEnabled(false);

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

  // Watch for customer search results - auto-fill customer info
  useEffect(() => {
    // Skip during initial render to prevent autofill from cached query results
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    if (!searchEnabled) return;
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
    } else if (phone.length > 5 && !searchingCustomers && searchEnabled) {
      setExistingCustomer(null);
    }
  }, [foundCustomers, searchingCustomers, searchEnabled, phone]);

  // Enable search only after user has changed the phone field
  useEffect(() => {
    if (phone !== '+961') {
      setSearchEnabled(true);
    }
  }, [phone]);
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
  const handleCloseModal = () => {
    navigate(-1);
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

      // Then create the order with full address data
      const orderData: Omit<Order, 'id' | 'reference_number' | 'created_at' | 'updated_at'> = {
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
        status: 'New'
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
  return <MainLayout className="p-0">
      <div className="flex flex-col h-full" key={formKey}>
        {/* Header with title and action buttons */}
        <div className="border-b bg-white shadow-sm my-0 mx-[29px] py-[16px] px-[24px] rounded">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Create a New  Order</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => handleSubmit(true)} className="whitespace-nowrap">
                Confirm & Create Another
              </Button>
              <Button variant="default" size="sm" onClick={() => handleSubmit(false)} className="whitespace-nowrap">
                Confirm Order
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main form content (scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Information */}
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-3">
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Phone number
                    </span>
                  </Label>
                  <PhoneInput id="phone" value={phone} onChange={handlePhoneChange} defaultCountry="LB" onValidationChange={setPhoneValid} placeholder="Enter phone number" className={errors.phone ? "border-red-500" : ""} errorMessage={errors.phone} />
                  {searchingCustomers && <p className="text-xs text-gray-500">Searching for existing customer...</p>}
                  {existingCustomer && searchEnabled && <p className="text-xs text-green-500 flex items-center gap-1"><Check className="h-3 w-3" />Existing customer found!</p>}
                </div>
                
                {/* Secondary Phone Field */}
                {!isSecondaryPhone && <div>
                    <Button type="button" variant="outline" className="text-sm flex items-center gap-1" onClick={() => setIsSecondaryPhone(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      Add secondary phone number
                    </Button>
                  </div>}

                {isSecondaryPhone && <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="secondary-phone" className={errors.secondaryPhone ? "text-red-500" : ""}>
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          Secondary phone
                        </span>
                      </Label>
                      <Button variant="link" className="text-xs text-muted-foreground h-auto p-0" onClick={() => {
                    setIsSecondaryPhone(false);
                    setSecondaryPhone('');
                    if (errors.secondaryPhone) {
                      setErrors(prev => ({
                        ...prev,
                        secondaryPhone: undefined
                      }));
                    }
                  }}>
                        Remove
                      </Button>
                    </div>
                    <PhoneInput id="secondary-phone" value={secondaryPhone} onChange={value => {
                  setSecondaryPhone(value);
                  if (errors.secondaryPhone) {
                    setErrors(prev => ({
                      ...prev,
                      secondaryPhone: undefined
                    }));
                  }
                }} defaultCountry="LB" onValidationChange={setSecondaryPhoneValid} placeholder="Enter secondary phone" className={errors.secondaryPhone ? "border-red-500" : ""} errorMessage={errors.secondaryPhone} />
                  </div>}
                
                {/* Customer Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>Full name</Label>
                  <Input id="name" placeholder="Enter customer name" value={name} onChange={e => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors(prev => ({
                      ...prev,
                      name: undefined
                    }));
                  }
                }} className={errors.name ? "border-red-500" : ""} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                
                {/* Area Selection - using the improved selector */}
                <div className="space-y-2">
                  <Label htmlFor="area" className={errors.area ? "text-red-500" : ""}>Area</Label>
                  <AreaSelector selectedArea={selectedCityName} selectedGovernorate={selectedGovernorateName} onAreaSelected={(governorateName, cityName, governorateId, cityId) => {
                  if (governorateId) handleGovernorateChange(governorateId, governorateName);
                  if (cityId) handleCityChange(cityId, cityName, governorateName);
                }} />
                </div>
                
                {/* Address Details */}
                <div className="space-y-2">
                  <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>Address details</Label>
                  <Input id="address" placeholder="Enter full address" value={address} onChange={e => {
                  setAddress(e.target.value);
                  if (errors.address) {
                    setErrors(prev => ({
                      ...prev,
                      address: undefined
                    }));
                  }
                }} className={errors.address ? "border-red-500" : ""} />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>
                
                {/* Work Address Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="work-address" checked={isWorkAddress} onCheckedChange={checked => {
                  if (typeof checked === 'boolean') {
                    setIsWorkAddress(checked);
                  }
                }} />
                  <div className="flex items-center">
                    <label htmlFor="work-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      This is a work address
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark if this is a business or work address</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Information */}
            <Card className="shadow-sm border-border/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Package</CardTitle>
                  <Button variant="link" className="text-blue-600 text-sm p-0" onClick={() => setGuidelinesModalOpen(true)}>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    Packaging Guidelines & Restrictions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <Input id="description" placeholder="Product name - code - color - size" value={description} onChange={e => setDescription(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Provide a brief description of the package contents</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="items-count">Number of items</Label>
                  <div className="relative">
                    <Input id="items-count" type="number" min={1} value={itemsCount} onChange={e => setItemsCount(parseInt(e.target.value) || 1)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right sidebar with order type, payment, and package type */}
          <div className="w-96 border-l overflow-y-auto bg-gray-50">
            <div className="p-6 space-y-6">
              {/* Order Type Selector */}
              <div className="space-y-3">
                <h3 className="font-medium text-base">Order Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant={orderType === 'shipment' ? "default" : "outline"} onClick={() => setOrderType('shipment')} className={cn(orderType === 'shipment' ? "bg-primary text-primary-foreground" : "", "shadow-sm h-10")}>
                    Shipment
                  </Button>
                  <Button variant={orderType === 'exchange' ? "default" : "outline"} onClick={() => setOrderType('exchange')} className={cn(orderType === 'exchange' ? "bg-primary text-primary-foreground" : "", "shadow-sm h-10")}>
                    Exchange
                  </Button>
                </div>
              </div>
              
              {/* Cash Collection - Moved higher up as requested */}
              <div className="pt-2">
                <ImprovedCashCollectionFields enabled={cashCollection} onEnabledChange={setCashCollection} usdAmount={usdAmount} lbpAmount={lbpAmount} onUsdAmountChange={value => {
                setUsdAmount(value);
                if (errors.usdAmount || errors.lbpAmount) {
                  setErrors(prev => ({
                    ...prev,
                    usdAmount: undefined,
                    lbpAmount: undefined
                  }));
                }
              }} onLbpAmountChange={value => {
                setLbpAmount(value);
                if (errors.usdAmount || errors.lbpAmount) {
                  setErrors(prev => ({
                    ...prev,
                    usdAmount: undefined,
                    lbpAmount: undefined
                  }));
                }
              }} deliveryFees={deliveryFees} errors={{
                usdAmount: errors.usdAmount,
                lbpAmount: errors.lbpAmount
              }} />
              </div>

              <Separator className="my-4" />
              
              {/* Package Type Section */}
              <div className="space-y-3">
                <h3 className="font-medium text-base">Package Type</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant={packageType === "parcel" ? "default" : "outline"} className="flex gap-1.5 h-10 text-sm py-2" onClick={() => setPackageType("parcel")}>
                    <Package className="h-4 w-4" />
                    Parcel
                  </Button>
                  <Button variant={packageType === "document" ? "default" : "outline"} className="flex gap-1.5 h-10 text-sm py-2" onClick={() => setPackageType("document")}>
                    <FileText className="h-4 w-4" />
                    Document
                  </Button>
                  <Button variant={packageType === "bulky" ? "default" : "outline"} className="flex gap-1.5 h-10 text-sm py-2" onClick={() => setPackageType("bulky")}>
                    <Package className="h-4 w-4" />
                    Bulky
                  </Button>
                </div>
                
                {/* Allow Opening Checkbox */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="allow-opening" checked={allowOpening} onCheckedChange={checked => {
                  if (typeof checked === 'boolean') {
                    setAllowOpening(checked);
                  }
                }} />
                  <div className="flex items-center">
                    <label htmlFor="allow-opening" className="text-sm font-medium leading-none">
                      Allow customers to open packages
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Allow customers to inspect the contents before accepting</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              
              {/* Additional Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-base">Additional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="order-reference">Order Reference</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Input id="order-reference" placeholder="For easier tracking" value={orderReference} onChange={e => setOrderReference(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="delivery-notes" className="flex items-center gap-1.5">
                        <ScrollText className="h-3.5 w-3.5" />
                        Delivery notes
                      </Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Textarea id="delivery-notes" placeholder="Special instructions for delivery" rows={3} value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="resize-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Package Guidelines Modal */}
      <PackageGuidelinesModal open={guidelinesModalOpen} onOpenChange={setGuidelinesModalOpen} />
    </MainLayout>;
};
export default CreateOrder;