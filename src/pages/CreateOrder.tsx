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
import { PackageGuidelinesModal } from '@/components/orders/PackageGuidelinesModal';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCity, useCitiesByGovernorate } from '@/hooks/use-cities';
import { useSearchCustomersByPhone, useCreateOrUpdateCustomer } from '@/hooks/use-customers';
import { useCreateOrder, useUpdateOrder, useOrder } from '@/hooks/use-orders';
import { useCalculateDeliveryFee } from '@/hooks/use-pricing';
import { useComprehensiveDeliveryFee } from '@/hooks/use-comprehensive-pricing';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerWithLocation } from '@/services/customers';
import { Order } from '@/services/orders';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import OrderTypeSelector from '@/components/dashboard/OrderTypeSelector';
import { useScreenSize } from '@/hooks/useScreenSize';
import { EnhancedDeliveryFeeDisplay } from '@/components/orders/EnhancedDeliveryFeeDisplay';

// Create a unique form key for forcing re-render
const getUniqueFormKey = () => `order-form-${Date.now()}`;
const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isMobile } = useScreenSize();
  const { user } = useAuth();
  
  // Check if we're in edit mode
  const urlParams = new URLSearchParams(location.search);
  const isEditMode = urlParams.get('edit') === 'true';
  const editOrderId = urlParams.get('id');
  
  // DEBUG: Log URL parameters and edit mode status
  console.log('🔍 CREATEORDER PAGE LOADED!');
  console.log('🌐 Current URL:', location.pathname + location.search);
  console.log('📊 URL Search Params:', location.search);
  console.log('✏️ isEditMode:', isEditMode);
  console.log('🆔 editOrderId:', editOrderId);
  console.log('🔗 Full URLParams object:', Object.fromEntries(urlParams.entries()));
  
  // Fetch order data if in edit mode
  const { data: editOrder, isLoading: orderLoading, error: orderError } = useOrder(editOrderId || undefined);
  
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

  // Calculate delivery fees using comprehensive pricing system
  const { data: calculatedFees, isLoading: feesLoading } = useComprehensiveDeliveryFee(
    user?.id,
    selectedGovernorateId || undefined,
    selectedCityId || undefined,
    packageType === 'parcel' ? 'Parcel' : packageType === 'document' ? 'Document' : 'Bulky'
  );

  console.log('💰 Dynamic Pricing Data:', {
    userId: user?.id,
    governorateId: selectedGovernorateId,
    cityId: selectedCityId,
    packageType,
    calculatedFees,
    feesLoading
  });

  // Delivery fees (from comprehensive pricing system)
  const deliveryFees = calculatedFees || { 
    total_fee_usd: 0, 
    total_fee_lbp: 0, 
    pricing_source: 'loading' 
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
  const createOrUpdateCustomer = useCreateOrUpdateCustomer();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  // Load order data for edit mode
  useEffect(() => {
    console.log('🔄 useEffect triggered - isEditMode:', isEditMode, 'editOrder:', !!editOrder);
    if (isEditMode && editOrder) {
      console.log('✅ EDIT MODE CONFIRMED - Loading order data:', editOrder);
      
      // Pre-fill form with existing order data
      setOrderType(editOrder.type === 'Exchange' ? 'exchange' : 'shipment');
      setPackageType((editOrder.package_type || 'parcel') as 'parcel' | 'document' | 'bulky');
      setDescription(editOrder.package_description || '');
      setItemsCount(editOrder.items_count || 1);
      setAllowOpening(editOrder.allow_opening || false);
      setCashCollection(editOrder.cash_collection_enabled || false);
      setUsdAmount(editOrder.cash_collection_usd?.toString() || '');
      setLbpAmount(editOrder.cash_collection_lbp?.toString() || '');
      setDeliveryNotes(editOrder.note || '');
      setOrderReference(editOrder.reference_number || '');

      console.log('📱 Order basic data loaded');

      // Load customer data - Check both possible data structures
      const customerData = editOrder.customer || editOrder;
      console.log('👤 Customer data structure:', customerData);
      
      if (customerData) {
        // Set phone and validate it
        if (customerData.phone) {
          console.log('📞 Setting phone:', customerData.phone);
          setPhone(customerData.phone);
          setPhoneValid(true);
        }
        
        // Set name
        if (customerData.name) {
          console.log('🏷️ Setting name:', customerData.name);
          setName(customerData.name);
        }
        
        // Set address
        if (customerData.address) {
          console.log('🏠 Setting address:', customerData.address);
          setAddress(customerData.address);
        }
        
        // Set work address flag
        setIsWorkAddress(customerData.is_work_address || false);
        
        // Set secondary phone if exists
        if (customerData.secondary_phone) {
          console.log('📱 Setting secondary phone:', customerData.secondary_phone);
          setSecondaryPhone(customerData.secondary_phone);
          setIsSecondaryPhone(true);
        }

        // Set location data (governorate and city)
        if (customerData.governorate_id && customerData.city_id) {
          console.log('🗺️ Setting location data:', {
            governorate_id: customerData.governorate_id,
            city_id: customerData.city_id,
            governorate_name: customerData.governorate_name,
            city_name: customerData.city_name
          });
          
          setSelectedGovernorateId(customerData.governorate_id);
          setSelectedCityId(customerData.city_id);
          setSelectedGovernorateName(customerData.governorate_name || '');
          setSelectedCityName(customerData.city_name || '');
        }

        setExistingCustomer(customerData as any);
        console.log('✅ Customer data loaded successfully');
      } else {
        console.error('❌ No customer data found in order:', editOrder);
      }
      
      console.log('🎯 Form state after loading:', {
        phone,
        name,
        address,
        governorate: selectedGovernorateName,
        city: selectedCityName,
        orderType,
        packageType,
        description
      });
    }
  }, [isEditMode, editOrder]);

  const clearCachedFormData = () => {
    const formKeys = ['order-form-data', 'order-form-customer', 'order-form-phone', 'order-form-address', 'order-form-governorate', 'order-form-city'];
    formKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  const resetForm = () => {
    // Only reset if not in edit mode
    if (!isEditMode) {
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
    }
  };

  useEffect(() => {
    // Only reset form if we're not in edit mode
    if (!isEditMode) {
      resetForm();
    }
    return () => {
      if (!isEditMode) {
        clearCachedFormData();
        queryClient.removeQueries({
          queryKey: ['customers', 'search']
        });
      }
    };
  }, [location.pathname, queryClient, isEditMode]);

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    // Skip auto-fill if we're in edit mode since we manually load the data
    if (isEditMode) return;
    
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
  }, [foundCustomers, searchingCustomers, phone, isEditMode]);

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
    
    // Make sure we have delivery fee data before proceeding
    if (!calculatedFees && !feesLoading) {
      toast.error("Unable to calculate delivery fees. Please try again.");
      return;
    }
    
    // If still loading fees, show a message and don't proceed
    if (feesLoading) {
      toast.info("Calculating delivery fees... Please wait.");
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
        
        try {
          const customer = await createOrUpdateCustomer.mutateAsync(customerData);
          customerId = customer.id;
        } catch (error: any) {
          // If there's still a conflict even with our smart logic, show user-friendly error
          if (error.message?.includes('phone number already exists')) {
            toast.error("A customer with this phone number already exists. Please check your customer list.");
            return;
          }
          throw error; // Re-throw other errors
        }
      }

      // Backend expects these type strings
      type BackendOrderType = "Deliver" | "Exchange" | "Cash Collection" | "Return";
      let typeForBackend: BackendOrderType;
      if (orderType === "shipment") typeForBackend = "Deliver";
      else if (orderType === "exchange") typeForBackend = "Exchange";
      else typeForBackend = "Deliver"; // default/fallback

      // Use the dynamically calculated delivery fees from the pricing system
      const orderPayload = {
        type: typeForBackend,
        customer_id: customerId,
        package_type: packageType,
        package_description: description || undefined,
        items_count: itemsCount,
        allow_opening: allowOpening,
        cash_collection_enabled: cashCollection,
        cash_collection_usd: cashCollection ? Number(usdAmount) || 0 : 0,
        cash_collection_lbp: cashCollection ? Number(lbpAmount) || 0 : 0,
        delivery_fees_usd: calculatedFees?.total_fee_usd || 0,
        delivery_fees_lbp: calculatedFees?.total_fee_lbp || 0,
        pricing_source: calculatedFees?.pricing_source || 'global',
        note: deliveryNotes || undefined,
        status: 'New' as import('@/services/orders').OrderStatus,
        ...(orderReference.trim() && {
          reference_number: orderReference.trim()
        })
      };

      if (isEditMode && editOrderId) {
        // -------- 🛠️ Enhanced Edit History Appending --------
        let previousHistory: Array<any> = [];
        if (editOrder?.edit_history && Array.isArray(editOrder.edit_history)) {
          previousHistory = [...editOrder.edit_history];
        }
        const changes: Array<any> = [];
        if (editOrder) {
          if (editOrder.customer?.phone !== phone) {
            changes.push({
              field: 'Phone',
              oldValue: editOrder.customer?.phone || '',
              newValue: phone,
              timestamp: new Date().toISOString(),
            });
          }
          if (editOrder.customer?.name !== name) {
            changes.push({
              field: 'Name',
              oldValue: editOrder.customer?.name || '',
              newValue: name,
              timestamp: new Date().toISOString(),
            });
          }
          if (editOrder.customer?.address !== address) {
            changes.push({
              field: 'Address',
              oldValue: editOrder.customer?.address || '',
              newValue: address,
              timestamp: new Date().toISOString(),
            });
          }
          if (editOrder.cash_collection_usd !== Number(usdAmount)) {
            changes.push({
              field: 'USD Amount',
              oldValue: editOrder.cash_collection_usd?.toString() || '0',
              newValue: usdAmount,
              timestamp: new Date().toISOString(),
            });
          }
          if (editOrder.cash_collection_lbp !== Number(lbpAmount)) {
            changes.push({
              field: 'LBP Amount',
              oldValue: editOrder.cash_collection_lbp?.toString() || '0',
              newValue: lbpAmount,
              timestamp: new Date().toISOString(),
            });
          }
        }

        // 👇 Append new changes to previous history
        const updatedEditHistory =
          changes.length > 0
            ? [...previousHistory, ...changes]
            : previousHistory;

        const updatePayload = {
          ...orderPayload,
          ...(changes.length > 0 && {
            edited: true,
            edit_history: updatedEditHistory
          })
        };

        await updateOrder.mutateAsync({
          id: editOrderId,
          updates: updatePayload as any // <-- This line fixes the type error safely for backend structure
        });
        toast.success("Order updated successfully.");
        navigate('/orders');
      } else {
        await createOrder.mutateAsync(orderPayload as any); // <-- This line fixes the type error safely for backend structure
        if (createAnother) {
          resetForm();
          toast.success("Order created successfully. Create another one.");
        } else {
          toast.success("Order created successfully.");
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error(isEditMode ? "Failed to update the order. Please try again." : "Failed to create the order. Please try again.");
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

  // Show loading state while fetching order data in edit mode
  if (isEditMode && orderLoading) {
    return (
      <MainLayout className="bg-gray-50/30">
        <div className="min-h-screen w-full">
          <div className="w-full px-4 py-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Order</h1>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading order data...</p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state if order fetch failed
  if (isEditMode && orderError) {
    return (
      <MainLayout className="bg-gray-50/30">
        <div className="min-h-screen w-full">
          <div className="w-full px-4 py-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Order</h1>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-destructive mb-4">Failed to load order data</p>
                <Button 
                  onClick={() => navigate('/dashboard/client/orders')}
                  variant="outline"
                >
                  Back to Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error if in edit mode but no order found
  if (isEditMode && !editOrder && !orderLoading) {
    return (
      <MainLayout className="bg-gray-50/30">
        <div className="min-h-screen w-full">
          <div className="w-full px-4 py-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Edit Order</h1>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-destructive mb-4">Order not found</p>
                <Button 
                  onClick={() => navigate('/dashboard/client/orders')}
                  variant="outline"
                >
                  Back to Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return <MainLayout className="bg-gray-50/30">
      <div className="min-h-screen w-full" key={formKey}>
        {/* Full width page container */}
        <div className="w-full px-4 py-6">
          
          {/* Page Header */}
          {!isMobile && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {isEditMode ? 'Edit Order' : 'Create New Order'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditMode ? 'Modify the order details below' : 'Fill in the details to create a new delivery order'}
                </p>
              </div>
              <div className="flex gap-3">
                {!isEditMode && (
                  <Button variant="outline" onClick={() => handleSubmit(true)} className="px-4 py-2 text-sm">
                    Create & Add Another
                  </Button>
                )}
                <Button onClick={() => handleSubmit(false)} className="px-6 py-2 text-sm bg-[#DC291E] hover:bg-[#c0211a]">
                  {isEditMode ? 'Update Order' : 'Create Order'}
                </Button>
              </div>
            </div>
          )}

          {/* Main Form - 100% Width Grid */}
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
                  {/* Phone and Name Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name field first (left) */}
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
                            setErrors(prev => ({
                              ...prev,
                              name: undefined
                            }));
                          }
                        }}
                        className={cn("h-10", errors.name ? "border-red-300" : "border-gray-300")}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600">{errors.name}</p>
                      )}
                    </div>
                    {/* Phone Number field second (right) */}
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
                        className={cn("h-10", errors.phone ? "border-red-300" : "border-gray-300")}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                      )}
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
                  </div>
                  
                  {/* Secondary Phone */}
                  {!isSecondaryPhone && <Button type="button" variant="outline" size="sm" onClick={() => setIsSecondaryPhone(true)} className="text-xs h-8 mx-0 py-0 my-0">
                      <Plus className="h-3 w-3 mr-1" />
                      Add secondary phone
                    </Button>}

                  {isSecondaryPhone && <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="secondary-phone" className={cn("text-sm font-medium", errors.secondaryPhone ? "text-red-600" : "text-gray-700")}>
                          Secondary Phone
                        </Label>
                        <Button variant="ghost" size="sm" onClick={() => {
                      setIsSecondaryPhone(false);
                      setSecondaryPhone('');
                      if (errors.secondaryPhone) {
                        setErrors(prev => ({
                          ...prev,
                          secondaryPhone: undefined
                        }));
                      }
                    }} className="text-xs h-6 px-2">
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
                  }} defaultCountry="LB" onValidationChange={setSecondaryPhoneValid} placeholder="Enter secondary phone" className={cn("h-10", errors.secondaryPhone ? "border-red-300" : "border-gray-300")} />
                      {errors.secondaryPhone && <p className="text-xs text-red-600">{errors.secondaryPhone}</p>}
                    </div>}
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
                  {/* Area Selection */}
                  <div className="space-y-2">
                    <Label className={cn("text-sm font-medium", errors.area ? "text-red-600" : "text-gray-700")}>
                      Area (Governorate & City)
                    </Label>
                    <AreaSelector selectedArea={selectedCityName} selectedGovernorate={selectedGovernorateName} onAreaSelected={(governorateName, cityName, governorateId, cityId) => {
                    if (governorateId) handleGovernorateChange(governorateId, governorateName);
                    if (cityId) handleCityChange(cityId, cityName, governorateName);
                  }} />
                    {errors.area && <p className="text-xs text-red-600">{errors.area}</p>}
                  </div>
                  
                  {/* Address Details */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className={cn("text-sm font-medium", errors.address ? "text-red-600" : "text-gray-700")}>
                      Address Details
                    </Label>
                    <Input id="address" placeholder="Building, street, landmark..." value={address} onChange={e => {
                    setAddress(e.target.value);
                    if (errors.address) {
                      setErrors(prev => ({
                        ...prev,
                        address: undefined
                      }));
                    }
                  }} className={cn("h-10", errors.address ? "border-red-300" : "border-gray-300")} />
                    {errors.address && <p className="text-xs text-red-600">{errors.address}</p>}
                  </div>
                  
                  {/* Work Address Checkbox */}
                  <div className="flex items-center space-x-3">
                    <Checkbox id="work-address" checked={isWorkAddress} onCheckedChange={checked => {
                    if (typeof checked === 'boolean') {
                      setIsWorkAddress(checked);
                    }
                  }} className="border-gray-300" />
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
                    <Button variant="link" onClick={() => setGuidelinesModalOpen(true)} className="text-xs text-blue-600 p-0 h-auto">
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
                      <Input id="description" placeholder="Electronics, clothes, etc." value={description} onChange={e => setDescription(e.target.value)} className="h-10 border-gray-300" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="items-count" className="text-sm font-medium text-gray-700">
                        Number of Items
                      </Label>
                      <Input id="items-count" type="number" min={1} value={itemsCount} onChange={e => setItemsCount(parseInt(e.target.value) || 1)} className="h-10 border-gray-300" />
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
                    <Button variant={orderType === 'shipment' ? "default" : "outline"} onClick={() => setOrderType('shipment')} className={cn("h-10 text-sm", orderType === 'shipment' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
                      Shipment
                    </Button>
                    <Button variant={orderType === 'exchange' ? "default" : "outline"} onClick={() => setOrderType('exchange')} className={cn("h-10 text-sm", orderType === 'exchange' ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
                      Exchange
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Enhanced Delivery Fee Display */}
              <EnhancedDeliveryFeeDisplay 
                fees={calculatedFees}
                isLoading={feesLoading}
                className="mb-4"
                clientId={user?.id}
                governorateId={selectedGovernorateId || undefined}
                cityId={selectedCityId || undefined}
                packageType={packageType === 'parcel' ? 'Parcel' : packageType === 'document' ? 'Document' : 'Bulky'}
              />

              {/* Cash Collection */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Cash Collection</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cash-collection" checked={cashCollection} onCheckedChange={checked => {
                      if (typeof checked === 'boolean') {
                        setCashCollection(checked);
                      }
                    }} className="border-gray-300" />
                    </div>
                  </div>
                </CardHeader>
                {cashCollection && <CardContent className="space-y-4">
                    {/* USD and LBP Side by Side with Enhanced Icons */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="usd-amount" className={cn("text-sm font-medium", errors.usdAmount ? "text-red-600" : "text-gray-700")}>
                          USD Amount
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600 font-semibold text-sm pointer-events-none z-10">
                            $
                          </span>
                          <Input id="usd-amount" type="text" value={usdAmount} onChange={e => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        const decimalParts = value.split('.');
                        if (decimalParts.length > 1) {
                          const wholeNumber = decimalParts[0];
                          const decimal = decimalParts.slice(1).join('').slice(0, 2);
                          setUsdAmount(`${wholeNumber}.${decimal}`);
                        } else {
                          setUsdAmount(value);
                        }
                        if (errors.usdAmount || errors.lbpAmount) {
                          setErrors(prev => ({
                            ...prev,
                            usdAmount: undefined,
                            lbpAmount: undefined
                          }));
                        }
                      }} className={cn("h-10 pl-8 bg-white", errors.usdAmount ? "border-red-300" : "border-gray-300")} placeholder="0.00" />
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
                          <Input id="lbp-amount" type="text" value={lbpAmount ? parseInt(lbpAmount).toLocaleString('en-US') : ''} onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setLbpAmount(rawValue);
                        if (errors.usdAmount || errors.lbpAmount) {
                          setErrors(prev => ({
                            ...prev,
                            usdAmount: undefined,
                            lbpAmount: undefined
                          }));
                        }
                      }} className={cn("h-10 pl-12 bg-white", errors.lbpAmount ? "border-red-300" : "border-gray-300")} placeholder="0" />
                        </div>
                        {errors.lbpAmount && <p className="text-xs text-red-600">{errors.lbpAmount}</p>}
                      </div>
                    </div>
                    
                    {/* Delivery Fees */}
                    <div className="flex flex-col p-3 rounded-md bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Delivery Fee:</span>
                        <div className="text-sm">
                          {feesLoading ? (
                            <span className="text-gray-500">Calculating...</span>
                          ) : (
                            <>
                              <span className="font-medium">${deliveryFees.total_fee_usd || 0}</span> 
                              <span className="mx-1 text-gray-500">|</span> 
                              <span className="font-medium">
                                {(deliveryFees.total_fee_lbp !== null && deliveryFees.total_fee_lbp !== undefined) 
                                  ? deliveryFees.total_fee_lbp.toLocaleString() 
                                  : '0'} LBP
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                        <span className="capitalize">
                          {feesLoading ? 'Loading pricing source...' : `Source: ${deliveryFees.pricing_source || 'global'}`}
                        </span>
                      </div>
                    </div>
                  </CardContent>}
              </Card>

              {/* Package Type */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Package Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant={packageType === "parcel" ? "default" : "outline"} onClick={() => setPackageType("parcel")} className={cn("h-14 flex-col gap-1 text-xs", packageType === "parcel" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
                      <Package className="h-4 w-4" />
                      Parcel
                    </Button>
                    <Button variant={packageType === "document" ? "default" : "outline"} onClick={() => setPackageType("document")} className={cn("h-14 flex-col gap-1 text-xs", packageType === "document" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
                      <FileText className="h-4 w-4" />
                      Document
                    </Button>
                    <Button variant={packageType === "bulky" ? "default" : "outline"} onClick={() => setPackageType("bulky")} className={cn("h-14 flex-col gap-1 text-xs", packageType === "bulky" ? "bg-[#DC291E] hover:bg-[#c0211a]" : "border-gray-300")}>
                      <Package className="h-4 w-4" />
                      Bulky
                    </Button>
                  </div>
                  
                  {/* Allow Opening Checkbox */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <Checkbox id="allow-opening" checked={allowOpening} onCheckedChange={checked => {
                    if (typeof checked === 'boolean') {
                      setAllowOpening(checked);
                    }
                  }} className="border-gray-300" />
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
                    <Label htmlFor="order-reference" className="text-sm font-medium text-gray-700">
                      Order Reference <span className="text-xs text-gray-500">(Optional)</span>
                    </Label>
                    <Input id="order-reference" placeholder="Your tracking reference" value={orderReference} onChange={e => setOrderReference(e.target.value)} className="h-10 border-gray-300" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery-notes" className="text-sm font-medium text-gray-700">
                      Delivery Notes <span className="text-xs text-gray-500">(Optional)</span>
                    </Label>
                    <Textarea id="delivery-notes" placeholder="Special delivery instructions..." rows={3} value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="resize-none border-gray-300 text-sm" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          {isMobile && (
            <div className="mt-8 space-y-3">
              <Button onClick={() => handleSubmit(false)} className="w-full py-3 bg-[#DC291E] hover:bg-[#c0211a]">
                {isEditMode ? 'Update Order' : 'Create Order'}
              </Button>
              {!isEditMode && (
                <Button variant="outline" onClick={() => handleSubmit(true)} className="w-full py-3 border-gray-300">
                  Create & Add Another
                </Button>
              )}
            </div>
          )}

          {/* Mobile Bottom Padding */}
          {isMobile && <div className="h-8"></div>}
        </div>
      </div>
      
      {/* Package Guidelines Modal */}
      <PackageGuidelinesModal open={guidelinesModalOpen} onOpenChange={setGuidelinesModalOpen} />
    </MainLayout>;
};
export default CreateOrder;
