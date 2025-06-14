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
import { useSearchCustomersByPhone, useCreateCustomer } from '@/hooks/use-customers';
import { useCreateOrder, useUpdateOrder, useOrder } from '@/hooks/use-orders';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerWithLocation } from '@/services/customers';
import { Order } from '@/services/orders';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import OrderTypeSelector from '@/components/dashboard/OrderTypeSelector';
import { useScreenSize } from '@/hooks/useScreenSize';
import { CustomerInfoSection } from "@/components/orders/sections/CustomerInfoSection";
import { AddressSection } from "@/components/orders/sections/AddressSection";
import { PackageSection } from "@/components/orders/sections/PackageSection";
import { OrderTypeSection } from "@/components/orders/sections/OrderTypeSection";
import { CashCollectionSection } from "@/components/orders/sections/CashCollectionSection";
import { AdditionalInfoSection } from "@/components/orders/sections/AdditionalInfoSection";
import { useOrderForm } from "@/hooks/useOrderForm";

// Create a unique form key for forcing re-render
const getUniqueFormKey = () => `order-form-${Date.now()}`;
const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isMobile } = useScreenSize();
  
  // Check if we're in edit mode
  const editOrderId = new URLSearchParams(location.search).get('edit');
  const isEditMode = !!editOrderId;
  
  // Fetch order data if in edit mode
  const { data: editOrder } = useOrder(editOrderId || undefined);
  
  const [formKey, setFormKey] = useState(getUniqueFormKey());
  const initialRenderRef = useRef(true);

  // ---- FIX: Add guidelines modal state ----
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);

  // Form state from hook
  const {
    orderType, setOrderType, phone, setPhone, secondaryPhone, setSecondaryPhone,
    isSecondaryPhone, setIsSecondaryPhone, name, setName, isWorkAddress, setIsWorkAddress,
    packageType, setPackageType, selectedGovernorateId, setSelectedGovernorateId, selectedCityId, setSelectedCityId,
    selectedGovernorateName, setSelectedGovernorateName, selectedCityName, setSelectedCityName, cashCollection, setCashCollection,
    usdAmount, setUsdAmount, lbpAmount, setLbpAmount, phoneValid, setPhoneValid, secondaryPhoneValid, setSecondaryPhoneValid,
    address, setAddress, description, setDescription, itemsCount, setItemsCount, orderReference, setOrderReference,
    deliveryNotes, setDeliveryNotes, allowOpening, setAllowOpening, existingCustomer, setExistingCustomer, errors, setErrors,
  } = useOrderForm(editOrder);

  // Delivery fees (calculated or fixed)
  const deliveryFees = {
    usd: 5,
    lbp: 150000
  };

  // Remove duplicated errors state (FIXED)
  // const [errors, setErrors] = useState<{
  //   phone?: string;
  //   secondaryPhone?: string;
  //   name?: string;
  //   area?: string;
  //   address?: string;
  //   usdAmount?: string;
  //   lbpAmount?: string;
  // }>({});

  // Supabase Integration - phone search only triggers when number is complete
  const {
    data: foundCustomers,
    isLoading: searchingCustomers,
    refetch: refetchCustomers
  } = useSearchCustomersByPhone(phone);
  const createCustomer = useCreateCustomer();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  // Load order data for edit mode
  useEffect(() => {
    if (isEditMode && editOrder) {
      // Pre-fill form with existing order data
      setOrderType(editOrder.type === 'Exchange' ? 'exchange' : 'shipment');
      setPackageType(editOrder.package_type as 'parcel' | 'document' | 'bulky');
      setDescription(editOrder.package_description || '');
      setItemsCount(editOrder.items_count || 1);
      setAllowOpening(editOrder.allow_opening || false);
      setCashCollection(editOrder.cash_collection_enabled || false);
      setUsdAmount(editOrder.cash_collection_usd?.toString() || '');
      setLbpAmount(editOrder.cash_collection_lbp?.toString() || '');
      setDeliveryNotes(editOrder.note || '');
      setOrderReference(editOrder.reference_number || '');

      // Load customer data
      if (editOrder.customer) {
        setPhone(editOrder.customer.phone);
        setName(editOrder.customer.name);
        setAddress(editOrder.customer.address || '');
        setIsWorkAddress(editOrder.customer.is_work_address || false);
        
        if (editOrder.customer.secondary_phone) {
          setSecondaryPhone(editOrder.customer.secondary_phone);
          setIsSecondaryPhone(true);
        }

        if (editOrder.customer.governorate_id && editOrder.customer.city_id) {
          setSelectedGovernorateId(editOrder.customer.governorate_id);
          setSelectedCityId(editOrder.customer.city_id);
          setSelectedGovernorateName(editOrder.customer.governorate_name || '');
          setSelectedCityName(editOrder.customer.city_name || '');
        }

        setExistingCustomer(editOrder.customer);
        setPhoneValid(true);
      }
    }
  }, [isEditMode, editOrder, setOrderType, setPackageType, setDescription, setItemsCount, setAllowOpening, setCashCollection, setUsdAmount, setLbpAmount, setDeliveryNotes, setOrderReference, setPhone, setName, setAddress, setIsWorkAddress, setSecondaryPhone, setIsSecondaryPhone, setSelectedGovernorateId, setSelectedCityId, setSelectedGovernorateName, setSelectedCityName, setExistingCustomer, setPhoneValid]);

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
  }, [location.pathname, queryClient, isEditMode, resetForm]);

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
  }, [foundCustomers, searchingCustomers, phone, isEditMode, setName, setAddress, setIsWorkAddress, setSelectedGovernorateId, setSelectedCityId, setSelectedGovernorateName, setSelectedCityName, setSecondaryPhone, setIsSecondaryPhone, setExistingCustomer]);

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
      }

      // Backend expects these type strings
      type BackendOrderType = "Deliver" | "Exchange" | "Cash Collection" | "Return";
      let typeForBackend: BackendOrderType;
      if (orderType === "shipment") typeForBackend = "Deliver";
      else if (orderType === "exchange") typeForBackend = "Exchange";
      else typeForBackend = "Deliver"; // default/fallback

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
        delivery_fees_usd: deliveryFees.usd,
        delivery_fees_lbp: deliveryFees.lbp,
        note: deliveryNotes || undefined,
        status: 'New' as import('@/services/orders').OrderStatus,
        ...(orderReference.trim() && {
          reference_number: orderReference.trim()
        })
      };

      if (isEditMode && editOrderId) {
        // Track changes for edit history
        const changes = [];
        if (editOrder) {
          if (editOrder.customer?.phone !== phone) {
            changes.push({ field: 'Phone', oldValue: editOrder.customer?.phone || '', newValue: phone });
          }
          if (editOrder.customer?.name !== name) {
            changes.push({ field: 'Name', oldValue: editOrder.customer?.name || '', newValue: name });
          }
          if (editOrder.customer?.address !== address) {
            changes.push({ field: 'Address', oldValue: editOrder.customer?.address || '', newValue: address });
          }
          if (editOrder.cash_collection_usd !== Number(usdAmount)) {
            changes.push({ field: 'USD Amount', oldValue: editOrder.cash_collection_usd?.toString() || '0', newValue: usdAmount });
          }
          if (editOrder.cash_collection_lbp !== Number(lbpAmount)) {
            changes.push({ field: 'LBP Amount', oldValue: editOrder.cash_collection_lbp?.toString() || '0', newValue: lbpAmount });
          }
        }

        // Update existing order with edit tracking
        const updatePayload = {
          ...orderPayload,
          ...(changes.length > 0 && {
            edited: true,
            edit_history: changes
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
                  <CustomerInfoSection
                    phone={phone} setPhone={setPhone} phoneValid={phoneValid} setPhoneValid={setPhoneValid}
                    name={name} setName={setName}
                    errors={errors} setErrors={setErrors}
                    searchingCustomers={searchingCustomers} existingCustomer={existingCustomer}
                    isSecondaryPhone={isSecondaryPhone} setIsSecondaryPhone={setIsSecondaryPhone}
                    secondaryPhone={secondaryPhone} setSecondaryPhone={setSecondaryPhone}
                    secondaryPhoneValid={secondaryPhoneValid} setSecondaryPhoneValid={setSecondaryPhoneValid}
                  />
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
                  <AddressSection
                    selectedGovernorateName={selectedGovernorateName}
                    selectedCityName={selectedCityName}
                    onAreaSelected={(govName, cityName, govId, cityId) => {
                      if (govId) {
                        setSelectedGovernorateId(govId);
                        setSelectedGovernorateName(govName);
                        setSelectedCityId('');
                        setSelectedCityName('');
                      }
                      if (cityId) {
                        setSelectedCityId(cityId);
                        setSelectedCityName(cityName);
                      }
                      if (errors.area) setErrors((prev: any) => ({ ...prev, area: undefined }));
                    }}
                    errors={errors}
                    address={address} setAddress={setAddress}
                    isWorkAddress={isWorkAddress} setIsWorkAddress={setIsWorkAddress}
                  />
                </CardContent>
              </Card>

              {/* Package Info */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  {/* Handled inside PackageSection */}
                </CardHeader>
                <CardContent className="space-y-4">
                  <PackageSection
                    description={description} setDescription={setDescription}
                    itemsCount={itemsCount} setItemsCount={setItemsCount}
                    packageType={packageType} setPackageType={setPackageType}
                    allowOpening={allowOpening} setAllowOpening={setAllowOpening}
                    onGuidelinesClick={() => setGuidelinesModalOpen(true)}
                  />
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
                  <OrderTypeSection orderType={orderType} setOrderType={setOrderType} />
                </CardContent>
              </Card>
              
              {/* Cash Collection */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4"></CardHeader>
                <CardContent>
                  <CashCollectionSection
                    cashCollection={cashCollection} setCashCollection={setCashCollection}
                    usdAmount={usdAmount} setUsdAmount={setUsdAmount}
                    lbpAmount={lbpAmount} setLbpAmount={setLbpAmount}
                    errors={errors} deliveryFees={deliveryFees}
                  />
                </CardContent>
              </Card>
              
              {/* Additional Info */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AdditionalInfoSection
                    orderReference={orderReference} setOrderReference={setOrderReference}
                    deliveryNotes={deliveryNotes} setDeliveryNotes={setDeliveryNotes}
                  />
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
