import React, { useState, useEffect } from 'react';
import { X, Info, Check, Plus, MapPin, Search, Phone, Package, FileText, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import { AreaNestedSelector } from '@/components/orders/AreaNestedSelector';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCity, useCitiesByGovernorate } from '@/hooks/use-cities';
import { useSearchCustomersByPhone, useCreateCustomer } from '@/hooks/use-customers';
import { useCreateOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerWithLocation } from '@/services/customers';
import { Order } from '@/services/orders';
import { cn } from '@/lib/utils';

const CreateOrder = () => {
  const navigate = useNavigate();
  
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
  const { data: governorates } = useGovernorates();
  const { data: cities } = useCitiesByGovernorate(selectedGovernorateId);
  const { data: foundCustomers, isLoading: searchingCustomers } = useSearchCustomersByPhone(phone);
  
  // Mutations
  const createCustomer = useCreateCustomer();
  const createOrder = useCreateOrder();
  
  // Reset form on page load (addresses requirement #2)
  useEffect(() => {
    resetForm();
  }, []);
  
  // Watch for customer search results - auto-fill customer info (addresses requirement #3)
  useEffect(() => {
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
    } else if (phone.length > 5 && !searchingCustomers) {
      setExistingCustomer(null);
    }
  }, [foundCustomers]);
  
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
      
      if (!customerId) {
        // Create a new customer
        const customerData = {
          name,
          phone,
          secondary_phone: isSecondaryPhone ? secondaryPhone : undefined,
          address,
          city_id: selectedCityId || null,
          governorate_id: selectedGovernorateId || null,
          is_work_address: isWorkAddress
        };
        
        const newCustomer = await createCustomer.mutateAsync(customerData);
        customerId = newCustomer.id;
      }
      
      // Then create the order
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
  };
  
  const handleGovernorateChange = (governorateId: string, governorateName: string) => {
    setSelectedGovernorateId(governorateId);
    setSelectedGovernorateName(governorateName);
    setSelectedCityId('');
    setSelectedCityName('');
    
    // Clear area error if it exists
    if (errors.area) {
      setErrors(prev => ({ ...prev, area: undefined }));
    }
  };
  
  const handleCityChange = (cityId: string, cityName: string, governorateName: string) => {
    setSelectedCityId(cityId);
    setSelectedCityName(cityName);
    
    // Clear area error if it exists
    if (errors.area) {
      setErrors(prev => ({ ...prev, area: undefined }));
    }
  };
  
  return (
    <MainLayout className="p-0">
      <div className="flex flex-col h-full">
        <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCloseModal}>
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Create New Order</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSubmit(true)}
              disabled={createCustomer.isPending || createOrder.isPending}
            >
              Confirm & Create Another
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleSubmit(false)}
              disabled={createCustomer.isPending || createOrder.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Check className="mr-1 h-4 w-4" />
              Confirm Order
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Information */}
            <Card>
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
                  <PhoneInput 
                    id="phone" 
                    value={phone} 
                    onChange={(value) => {
                      setPhone(value);
                      // Clear phone error if it exists
                      if (errors.phone) {
                        setErrors(prev => ({ ...prev, phone: undefined }));
                      }
                    }} 
                    defaultCountry="LB" 
                    onValidationChange={setPhoneValid} 
                    placeholder="Enter phone number" 
                    className={errors.phone ? "border-red-500" : ""}
                    errorMessage={errors.phone}
                  />
                  {searchingCustomers && <p className="text-xs text-gray-500">Searching for existing customer...</p>}
                  {existingCustomer && <p className="text-xs text-green-500 flex items-center gap-1"><Check className="h-3 w-3" />Existing customer found!</p>}
                </div>
                
                {/* Secondary Phone Field */}
                {!isSecondaryPhone && (
                  <div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="text-sm flex items-center gap-1" 
                      onClick={() => setIsSecondaryPhone(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add secondary phone number
                    </Button>
                  </div>
                )}

                {isSecondaryPhone && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label 
                        htmlFor="secondary-phone"
                        className={errors.secondaryPhone ? "text-red-500" : ""}
                      >
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          Secondary phone
                        </span>
                      </Label>
                      <Button 
                        variant="link" 
                        className="text-xs text-muted-foreground h-auto p-0" 
                        onClick={() => {
                          setIsSecondaryPhone(false);
                          setSecondaryPhone('');
                          if (errors.secondaryPhone) {
                            setErrors(prev => ({ ...prev, secondaryPhone: undefined }));
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <PhoneInput 
                      id="secondary-phone" 
                      value={secondaryPhone} 
                      onChange={(value) => {
                        setSecondaryPhone(value);
                        if (errors.secondaryPhone) {
                          setErrors(prev => ({ ...prev, secondaryPhone: undefined }));
                        }
                      }}
                      defaultCountry="LB" 
                      onValidationChange={setSecondaryPhoneValid} 
                      placeholder="Enter secondary phone" 
                      className={errors.secondaryPhone ? "border-red-500" : ""}
                      errorMessage={errors.secondaryPhone}
                    />
                  </div>
                )}
                
                {/* Customer Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>Full name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter customer name" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                
                {/* Area Selection - using the new nested component */}
                <div className="space-y-2">
                  <Label htmlFor="area" className={errors.area ? "text-red-500" : ""}>Area</Label>
                  <AreaNestedSelector
                    selectedGovernorateId={selectedGovernorateId}
                    selectedCityId={selectedCityId}
                    onGovernorateChange={handleGovernorateChange}
                    onCityChange={handleCityChange}
                  />
                  {errors.area && <p className="text-xs text-red-500">{errors.area}</p>}
                  {selectedGovernorateName && selectedCityName && (
                    <p className="text-xs text-muted-foreground">
                      Selected: <span className="font-medium">{selectedGovernorateName}, {selectedCityName}</span>
                    </p>
                  )}
                </div>
                
                {/* Address Details */}
                <div className="space-y-2">
                  <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>Address details</Label>
                  <Input 
                    id="address" 
                    placeholder="Enter full address" 
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) {
                        setErrors(prev => ({ ...prev, address: undefined }));
                      }
                    }}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>
                
                {/* Work Address Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="work-address" 
                    checked={isWorkAddress} 
                    onCheckedChange={checked => {
                      if (typeof checked === 'boolean') {
                        setIsWorkAddress(checked);
                      }
                    }} 
                  />
                  <div className="flex items-center">
                    <label 
                      htmlFor="work-address" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      This is a work address.
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
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Package</CardTitle>
                  <Button 
                    variant="link" 
                    className="text-blue-600 text-sm p-0"
                    onClick={() => toast.info("Prohibited items: Liquids, flammable materials, perishable goods, and valuables over $500.")}
                  >
                    Prohibited items
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <Input 
                    id="description" 
                    placeholder="Product name - code - color - size" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Provide a brief description of the package contents</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="items-count">Number of items</Label>
                  <Button 
                    variant="link" 
                    className="text-blue-600 text-sm p-0"
                    onClick={() => toast.info("Packaging Guidelines: Use sturdy boxes, bubble wrap for fragile items, and secure sealing tape.")}
                  >
                    Packaging Guidelines
                  </Button>
                </div>
                <div className="relative">
                  <Input 
                    id="items-count" 
                    type="number" 
                    min={1} 
                    value={itemsCount}
                    onChange={(e) => setItemsCount(parseInt(e.target.value))}
                    className="pr-8" 
                  />
                  <div className="absolute right-2 top-0 h-full flex flex-col justify-center">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setItemsCount(prev => prev + 1)}
                      type="button"
                    >▲</button>
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setItemsCount(prev => Math.max(1, prev - 1))}
                      type="button"
                    >▼</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right sidebar with order type and payment */}
          <div className="w-96 border-l overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-6">
              {/* Order Type Selector */}
              <div className="space-y-3">
                <h3 className="font-medium">Order Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={orderType === 'shipment' ? "default" : "outline"} 
                    onClick={() => setOrderType('shipment')} 
                    className={orderType === 'shipment' ? "bg-primary text-primary-foreground" : ""}
                  >
                    Shipment
                  </Button>
                  <Button 
                    variant={orderType === 'exchange' ? "default" : "outline"} 
                    onClick={() => setOrderType('exchange')} 
                    className={orderType === 'exchange' ? "bg-primary text-primary-foreground" : ""}
                  >
                    Exchange
                  </Button>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                {/* Cash Collection Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cash-collection"
                      checked={cashCollection}
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          setCashCollection(checked);
                          if (!checked) {
                            setUsdAmount('');
                            setLbpAmount('');
                            // Clear any errors
                            setErrors(prev => ({
                              ...prev,
                              usdAmount: undefined,
                              lbpAmount: undefined
                            }));
                          }
                        }
                      }}
                    />
                    <div className="flex items-center">
                      <label
                        htmlFor="cash-collection"
                        className="text-sm font-medium leading-none"
                      >
                        Cash collection
                      </label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enable this if you want to collect cash upon delivery</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {cashCollection && (
                    <div className="space-y-3 pt-1 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="usd-amount" className={errors.usdAmount ? "text-red-500" : ""}>
                          USD Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="usd-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={usdAmount}
                            onChange={(e) => {
                              setUsdAmount(e.target.value);
                              if (errors.usdAmount) {
                                setErrors(prev => ({
                                  ...prev,
                                  usdAmount: undefined,
                                  lbpAmount: undefined
                                }));
                              }
                            }}
                            className={cn("pl-8", errors.usdAmount ? "border-red-500" : "")}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lbp-amount" className={errors.lbpAmount ? "text-red-500" : ""}>
                          LBP Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">LBP</span>
                          <Input
                            id="lbp-amount"
                            type="number"
                            min="0"
                            value={lbpAmount}
                            onChange={(e) => {
                              setLbpAmount(e.target.value);
                              if (errors.lbpAmount) {
                                setErrors(prev => ({
                                  ...prev,
                                  usdAmount: undefined,
                                  lbpAmount: undefined
                                }));
                              }
                            }}
                            className={cn("pl-10", errors.lbpAmount ? "border-red-500" : "")}
                          />
                        </div>
                      </div>
                      
                      {(errors.usdAmount || errors.lbpAmount) && (
                        <p className="text-xs text-red-500">
                          At least one currency amount must be provided
                        </p>
                      )}
                    </div>
                  )}

                  {/* Display delivery fees */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span>Delivery fees:</span>
                      <div className="space-x-2">
                        <span>${deliveryFees.usd}</span>
                        <span className="text-muted-foreground">|</span>
                        <span>{deliveryFees.lbp.toLocaleString()} LBP</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="allow-opening" 
                      checked={allowOpening}
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          setAllowOpening(checked);
                        }
                      }}
                    />
                    <div className="flex items-center">
                      <label htmlFor="allow-opening" className="text-sm font-medium leading-none">
                        Allow customers to open packages.
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
                  
                  <div>
                    <div className="mb-2 text-sm font-medium">Package type</div>
                    <div className="flex space-x-2">
                      <Button 
                        variant={packageType === "parcel" ? "default" : "outline"} 
                        className="flex-1 flex gap-1.5" 
                        onClick={() => setPackageType("parcel")}
                      >
                        <Package className="h-4 w-4" />
                        Parcel
                      </Button>
                      <Button 
                        variant={packageType === "document" ? "default" : "outline"} 
                        className="flex-1 flex gap-1.5" 
                        onClick={() => setPackageType("document")}
                      >
                        <FileText className="h-4 w-4" />
                        Document
                      </Button>
                      <Button 
                        variant={packageType === "bulky" ? "default" : "outline"} 
                        className="flex-1 flex gap-1.5" 
                        onClick={() => setPackageType("bulky")}
                      >
                        <Package className="h-4 w-4" />
                        Bulky
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="order-reference">Order reference</Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Input 
                      id="order-reference" 
                      placeholder="For an easier search use a reference code." 
                      value={orderReference}
                      onChange={(e) => setOrderReference(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="delivery-notes" className="flex items-center gap-1.5">
                        <ScrollText className="h-4 w-4" />
                        Delivery notes
                      </Label>
                      <span className="text-xs text-muted-foreground">Optional</span>
                    </div>
                    <Textarea 
                      id="delivery-notes" 
                      placeholder="Please contact the customer before delivering the order." 
                      rows={3}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateOrder;
