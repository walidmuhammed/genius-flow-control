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
import IntegratedCashCollectionFields from '@/components/orders/IntegratedCashCollectionFields';

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

      // Use the dynamically calculated delivery fees from the pricing system
      const orderPayload = {
        type: (orderType === "exchange" ? "Exchange" : "Deliver") as import('@/services/orders').OrderType,
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
          // Add more field comparisons as needed
        }
        
        if (changes.length > 0) {
          const newEditHistory = [
            ...previousHistory,
            {
              timestamp: new Date().toISOString(),
              user_id: user?.id,
              user_email: user?.email,
              changes: changes
            }
          ];
          (orderPayload as any).edit_history = newEditHistory;
        }
        
        await updateOrder.mutateAsync({
          id: editOrderId,
          updates: orderPayload
        });
        toast.success("Order updated successfully!");
        navigate('/dashboard/client/orders');
      } else {
        const newOrder = await createOrder.mutateAsync(orderPayload);
        console.log('✅ Order created successfully:', newOrder);
        toast.success("Order created successfully!");
        
        if (createAnother) {
          resetForm();
          setFormKey(getUniqueFormKey());
          navigate('/dashboard/client/create-order', { replace: true });
        } else {
          navigate('/dashboard/client/orders');
        }
      }
    } catch (error: any) {
      console.error('❌ Error in order creation/update:', error);
      
      // Enhanced error handling with specific messages
      if (error.message?.includes('phone number already exists')) {
        toast.error("A customer with this phone number already exists. Please check your customer list.");
      } else if (error.message?.includes('duplicate')) {
        toast.error("Duplicate entry detected. Please check your data and try again.");
      } else if (error.message?.includes('pricing')) {
        toast.error("Unable to calculate delivery fees. Please try again.");
      } else {
        const errorMessage = error.message || 'An unexpected error occurred';
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} order: ${errorMessage}`);
      }
    }
  };

  const isFormValid = () => {
    return (
      phoneValid &&
      name.trim() &&
      selectedGovernorateId &&
      selectedCityId &&
      address.trim() &&
      (!isSecondaryPhone || secondaryPhoneValid || !secondaryPhone) &&
      (!cashCollection || (Number(usdAmount) > 0 || Number(lbpAmount) > 0))
    );
  };

  const handlePhoneChange = (value: string, isValid: boolean) => {
    setPhone(value || '+961');
    setPhoneValid(isValid);
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: undefined
      }));
    }
  };

  // Show loading state while fetching order data for edit mode
  if (isEditMode && orderLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading order data...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show error state if order fetch failed
  if (isEditMode && orderError) {
    return (
      <MainLayout>
        <div className="p-6 max-w-7xl mx-auto">
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
      </MainLayout>
    );
  }

  // Show error if in edit mode but no order found
  if (isEditMode && !editOrder && !orderLoading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-7xl mx-auto">
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
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditMode ? 'Edit Order' : 'Create New Order'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Modify the existing order details' : 'Fill in the details to create a new order'}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard/client/orders')} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
          {/* Left Column - Main Form (70%) */}
          <div className="xl:col-span-7 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phone and Name on same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter customer name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) {
                          setErrors({...errors, name: undefined});
                        }
                      }}
                      className={cn(errors.name && "border-destructive")}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      Phone Number *
                      {existingCustomer && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Existing Customer
                        </span>
                      )}
                    </Label>
                    <PhoneInput
                      value={phone}
                      onChange={(value) => {
                        setPhone(value || '+961');
                        if (errors.phone) {
                          setErrors({...errors, phone: undefined});
                        }
                      }}
                      onValidationChange={setPhoneValid}
                      placeholder="Enter phone number"
                      id="phone"
                      className={cn(errors.phone && "border-destructive")}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>

                {/* Secondary Phone */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="secondary-phone"
                      checked={isSecondaryPhone}
                      onCheckedChange={(checked) => {
                        setIsSecondaryPhone(!!checked);
                        if (!checked) {
                          setSecondaryPhone('');
                          setSecondaryPhoneValid(false);
                          setErrors({...errors, secondaryPhone: undefined});
                        }
                      }}
                    />
                    <Label htmlFor="secondary-phone">Add secondary phone number</Label>
                  </div>
                  {isSecondaryPhone && (
                    <div className="space-y-2">
                      <PhoneInput
                        value={secondaryPhone}
                        onChange={(value) => {
                          setSecondaryPhone(value || '');
                          if (errors.secondaryPhone) {
                            setErrors({...errors, secondaryPhone: undefined});
                          }
                        }}
                        onValidationChange={setSecondaryPhoneValid}
                        placeholder="Enter secondary phone number"
                        className={cn(errors.secondaryPhone && "border-destructive")}
                      />
                      {errors.secondaryPhone && <p className="text-sm text-destructive">{errors.secondaryPhone}</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AreaSelector
                  selectedArea={selectedCityName}
                  selectedGovernorate={selectedGovernorateName}
                  onAreaSelected={(governorate, area, governorateId, areaId) => {
                    setSelectedGovernorateId(governorateId || '');
                    setSelectedGovernorateName(governorate);
                    setSelectedCityId(areaId || '');
                    setSelectedCityName(area);
                    if (errors.area) {
                      setErrors({...errors, area: undefined});
                    }
                  }}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Detailed Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter building, street, floor details"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) {
                        setErrors({...errors, address: undefined});
                      }
                    }}
                    className={cn(errors.address && "border-destructive")}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="work-address"
                    checked={isWorkAddress}
                    onCheckedChange={(checked) => setIsWorkAddress(!!checked)}
                  />
                  <Label htmlFor="work-address" className="text-sm font-medium">
                    This is a work/business address
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Package Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Package Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Package Type *
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-blue-600 hover:text-blue-800"
                            onClick={() => setGuidelinesModalOpen(true)}
                            type="button"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to view package guidelines</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['parcel', 'document', 'bulky'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={packageType === type ? 'default' : 'outline'}
                        onClick={() => setPackageType(type)}
                        className="capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Package Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the package contents (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="items-count">Number of Items</Label>
                    <Input
                      id="items-count"
                      type="number"
                      min="1"
                      value={itemsCount}
                      onChange={(e) => setItemsCount(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow-opening"
                        checked={allowOpening}
                        onCheckedChange={(checked) => setAllowOpening(!!checked)}
                      />
                      <Label htmlFor="allow-opening" className="text-sm">
                        Allow opening for inspection
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar (30%) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Order Type Selection */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTypeSelector
                  value={orderType}
                  onChange={(value) => {
                    if (value === 'shipment' || value === 'exchange') {
                      setOrderType(value);
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Cash Collection & Order Summary */}
            <IntegratedCashCollectionFields
              enabled={cashCollection}
              onEnabledChange={setCashCollection}
              usdAmount={usdAmount}
              lbpAmount={lbpAmount}
              onUsdAmountChange={setUsdAmount}
              onLbpAmountChange={setLbpAmount}
              deliveryFees={deliveryFees}
              isFeesLoading={feesLoading}
              errors={errors}
              clientId={user?.id}
              governorateId={selectedGovernorateId}
              cityId={selectedCityId}
              packageType={packageType === 'parcel' ? 'Parcel' : packageType === 'document' ? 'Document' : 'Bulky'}
            />

            {/* Additional Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-reference">Order Reference</Label>
                  <Input
                    id="order-reference"
                    type="text"
                    placeholder="Your internal reference"
                    value={orderReference}
                    onChange={(e) => setOrderReference(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-notes">Delivery Notes</Label>
                  <Textarea
                    id="delivery-notes"
                    placeholder="Special instructions"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={!isFormValid() || (createOrder.isPending || updateOrder.isPending)}
                className="w-full"
                size="lg"
              >
                {createOrder.isPending || updateOrder.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditMode ? 'Update Order' : 'Create Order'
                )}
              </Button>
              
              {!isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={!isFormValid() || createOrder.isPending}
                  className="w-full"
                  size="lg"
                >
                  Create & Add Another
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <PackageGuidelinesModal
        open={guidelinesModalOpen}
        onOpenChange={setGuidelinesModalOpen}
      />
    </MainLayout>
  );
};

export default CreateOrder;