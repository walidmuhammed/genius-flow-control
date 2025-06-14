import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useCreateOrder, useUpdateOrder } from '@/hooks/use-orders';
import { useSearchCustomersByPhone, useCreateCustomer } from '@/hooks/use-customers';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCities } from '@/hooks/use-cities';
import { OrderWithCustomer, OrderType, PackageType } from '@/services/orders';
import { Customer } from '@/services/customers';
import { PhoneInput } from '@/components/ui/phone-input';
import { ImprovedCashCollectionFields } from './ImprovedCashCollectionFields';
import { toast } from 'sonner';
import { Package, FileText, Box, Plus } from 'lucide-react';

interface CreateOrderFormProps {
  initialOrder?: OrderWithCustomer;
  isEditing?: boolean;
}

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ initialOrder, isEditing = false }) => {
  const navigate = useNavigate();
  const createOrderMutation = useCreateOrder();
  const updateOrderMutation = useUpdateOrder();
  
  // Form state
  const [orderType, setOrderType] = useState<OrderType>(initialOrder?.type || 'Deliver');
  const [packageType, setPackageType] = useState<PackageType>(initialOrder?.package_type || 'parcel');
  const [packageDescription, setPackageDescription] = useState(initialOrder?.package_description || '');
  const [itemsCount, setItemsCount] = useState(initialOrder?.items_count || 1);
  const [allowOpening, setAllowOpening] = useState(initialOrder?.allow_opening || false);
  const [note, setNote] = useState(initialOrder?.note || '');
  const [orderReference, setOrderReference] = useState('');
  
  // Customer state
  const [customerPhone, setCustomerPhone] = useState(initialOrder?.customer?.phone || '');
  const [customerName, setCustomerName] = useState(initialOrder?.customer?.name || '');
  const [customerAddress, setCustomerAddress] = useState(initialOrder?.customer?.address || '');
  const [secondaryPhone, setSecondaryPhone] = useState(initialOrder?.customer?.secondary_phone || '');
  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);
  const [selectedGovernorate, setSelectedGovernorate] = useState(initialOrder?.customer?.governorate_id || '');
  const [selectedCity, setSelectedCity] = useState(initialOrder?.customer?.city_id || '');
  const [isWorkAddress, setIsWorkAddress] = useState(initialOrder?.customer?.is_work_address || false);
  
  // Cash collection state
  const [cashCollectionEnabled, setCashCollectionEnabled] = useState(initialOrder?.cash_collection_enabled || false);
  const [cashCollectionUSD, setCashCollectionUSD] = useState(initialOrder?.cash_collection_usd || 0);
  const [cashCollectionLBP, setCashCollectionLBP] = useState(initialOrder?.cash_collection_lbp || 0);
  
  // Delivery fees
  const [deliveryFeesUSD, setDeliveryFeesUSD] = useState(initialOrder?.delivery_fees_usd || 5);
  const [deliveryFeesLBP, setDeliveryFeesLBP] = useState(initialOrder?.delivery_fees_lbp || 150000);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialOrder?.customer ? {
      id: initialOrder.customer.id,
      name: initialOrder.customer.name,
      phone: initialOrder.customer.phone,
      address: initialOrder.customer.address,
      governorate_id: initialOrder.customer.governorate_id,
      city_id: initialOrder.customer.city_id,
      is_work_address: initialOrder.customer.is_work_address,
      created_at: initialOrder.customer.created_at,
      updated_at: initialOrder.customer.updated_at,
      secondary_phone: initialOrder.customer.secondary_phone
    } : null
  );

  // Hooks
  const { data: searchResults = [] } = useSearchCustomersByPhone(customerPhone);
  const { data: governorates = [] } = useGovernorates();
  const { data: cities = [] } = useCities();
  const createCustomerMutation = useCreateCustomer();

  const showCustomerSearch = customerPhone.length >= 8 && !selectedCustomer;
  const showNewCustomerForm = customerPhone.length >= 8 && searchResults.length === 0 && !selectedCustomer;

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerAddress(customer.address || '');
    setSelectedGovernorate(customer.governorate_id || '');
    setSelectedCity(customer.city_id || '');
    setIsWorkAddress(customer.is_work_address || false);
    setSecondaryPhone(customer.secondary_phone || '');
    setShowSecondaryPhone(!!customer.secondary_phone);
  };

  const resetCustomerForm = () => {
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerAddress('');
    setSelectedGovernorate('');
    setSelectedCity('');
    setIsWorkAddress(false);
    setSecondaryPhone('');
    setShowSecondaryPhone(false);
  };

  const generateEditHistory = (original: OrderWithCustomer, updated: any) => {
    const changes: any[] = [];
    const currentHistory = Array.isArray(original.edit_history) ? original.edit_history : [];

    // Compare order type
    if (original.type !== updated.type) {
      changes.push({
        field: 'Order Type',
        oldValue: original.type,
        newValue: updated.type,
        timestamp: new Date().toISOString()
      });
    }

    // Compare package type
    if (original.package_type !== updated.package_type) {
      changes.push({
        field: 'Package Type',
        oldValue: original.package_type,
        newValue: updated.package_type,
        timestamp: new Date().toISOString()
      });
    }

    // Compare cash collection
    if (original.cash_collection_usd !== updated.cash_collection_usd) {
      changes.push({
        field: 'Cash Collection USD',
        oldValue: original.cash_collection_usd,
        newValue: updated.cash_collection_usd,
        timestamp: new Date().toISOString()
      });
    }

    // Compare customer details
    if (original.customer.name !== updated.customerName) {
      changes.push({
        field: 'Customer Name',
        oldValue: original.customer.name,
        newValue: updated.customerName,
        timestamp: new Date().toISOString()
      });
    }

    if (original.customer.phone !== updated.customerPhone) {
      changes.push({
        field: 'Customer Phone',
        oldValue: original.customer.phone,
        newValue: updated.customerPhone,
        timestamp: new Date().toISOString()
      });
    }

    if (original.customer.address !== updated.customerAddress) {
      changes.push({
        field: 'Address',
        oldValue: original.customer.address || '',
        newValue: updated.customerAddress,
        timestamp: new Date().toISOString()
      });
    }

    return [...currentHistory, ...changes];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerPhone || !customerName) {
      toast.error('Please fill in customer phone and name');
      return;
    }

    try {
      let customerId = selectedCustomer?.id;

      // Create customer if needed
      if (!selectedCustomer) {
        if (!selectedGovernorate || !selectedCity) {
          toast.error('Please select governorate and city');
          return;
        }

        const newCustomer = await createCustomerMutation.mutateAsync({
          name: customerName,
          phone: customerPhone,
          secondary_phone: secondaryPhone || undefined,
          address: customerAddress,
          governorate_id: selectedGovernorate,
          city_id: selectedCity,
          is_work_address: isWorkAddress
        });
        customerId = newCustomer.id;
      }

      if (!customerId) {
        toast.error('Failed to get customer ID');
        return;
      }

      const orderData = {
        type: orderType,
        package_type: packageType,
        package_description: packageDescription,
        items_count: itemsCount,
        allow_opening: allowOpening,
        cash_collection_enabled: cashCollectionEnabled,
        cash_collection_usd: cashCollectionUSD,
        cash_collection_lbp: cashCollectionLBP,
        delivery_fees_usd: deliveryFeesUSD,
        delivery_fees_lbp: deliveryFeesLBP,
        note: note,
        status: 'New' as const,
        customer_id: customerId
      };

      if (isEditing && initialOrder) {
        // Generate edit history
        const editHistory = generateEditHistory(initialOrder, {
          ...orderData,
          customerName,
          customerPhone,
          customerAddress
        });

        await updateOrderMutation.mutateAsync({
          id: initialOrder.id,
          updates: orderData,
          editHistory
        });
        
        navigate('/orders');
      } else {
        await createOrderMutation.mutateAsync(orderData);
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleCreateAndAddAnother = async (e: React.FormEvent) => {
    e.preventDefault();
    // Same logic as handleSubmit but don't navigate away
    // Just reset the form for another order
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-1">Fill out the form below to create a new delivery order</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleCreateAndAddAnother}
            disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
          >
            Create & Add Another
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
          >
            {isEditing ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <PhoneInput
                  id="phone"
                  value={customerPhone}
                  onChange={setCustomerPhone}
                  className="w-full"
                />
                {customerPhone.length >= 8 && selectedCustomer && (
                  <button
                    type="button"
                    onClick={resetCustomerForm}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear and search again
                  </button>
                )}
              </div>

              {showCustomerSearch && searchResults.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Existing Customers Found</h4>
                    <div className="space-y-2">
                      {searchResults.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.phone}</p>
                          </div>
                          <Button size="sm" variant="outline">Select</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(showNewCustomerForm || selectedCustomer) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Secondary Phone</Label>
                    {showSecondaryPhone ? (
                      <PhoneInput
                        value={secondaryPhone}
                        onChange={setSecondaryPhone}
                        className="w-full"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSecondaryPhone(true)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="h-4 w-4" />
                        Add secondary phone
                      </button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Address Information */}
          {(showNewCustomerForm || selectedCustomer) && (
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Governorate</Label>
                    <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select governorate" />
                      </SelectTrigger>
                      <SelectContent>
                        {governorates.map((gov) => (
                          <SelectItem key={gov.id} value={gov.id}>
                            {gov.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedGovernorate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.filter(city => city.governorate_id === selectedGovernorate).map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter complete address..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="work-address"
                    checked={isWorkAddress}
                    onCheckedChange={(checked) => setIsWorkAddress(checked === true)}
                  />
                  <Label htmlFor="work-address">This is a work address</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Package Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Package Information</CardTitle>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Guidelines
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="package-description">Package Description</Label>
                <Input
                  id="package-description"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="Describe the package contents..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="items-count">Items Count</Label>
                <Input
                  id="items-count"
                  type="number"
                  value={itemsCount}
                  onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-opening"
                  checked={allowOpening}
                  onCheckedChange={(checked) => setAllowOpening(checked === true)}
                />
                <Label htmlFor="allow-opening">Allow opening package for inspection</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Type */}
          <Card>
            <CardHeader>
              <CardTitle>Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ToggleGroup 
                type="single" 
                value={orderType === 'Deliver' ? 'shipment' : orderType === 'Exchange' ? 'exchange' : 'cash-collection'}
                onValueChange={(value) => {
                  if (value === 'shipment') setOrderType('Deliver');
                  else if (value === 'exchange') setOrderType('Exchange');
                  else if (value === 'cash-collection') setOrderType('Cash Collection');
                }}
                className="grid grid-cols-2 gap-2 w-full"
              >
                <ToggleGroupItem value="shipment" className="flex-1">
                  Shipment
                </ToggleGroupItem>
                <ToggleGroupItem value="exchange" className="flex-1">
                  Exchange
                </ToggleGroupItem>
              </ToggleGroup>
            </CardContent>
          </Card>

          {/* Cash Collection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cash Collection</CardTitle>
                <Switch 
                  checked={cashCollectionEnabled} 
                  onCheckedChange={setCashCollectionEnabled}
                />
              </div>
            </CardHeader>
            {cashCollectionEnabled && (
              <CardContent>
                <ImprovedCashCollectionFields
                  enabled={cashCollectionEnabled}
                  onEnabledChange={setCashCollectionEnabled}
                  usdAmount={cashCollectionUSD.toString()}
                  lbpAmount={cashCollectionLBP.toString()}
                  onUsdAmountChange={(amount) => setCashCollectionUSD(parseFloat(amount) || 0)}
                  onLbpAmountChange={(amount) => setCashCollectionLBP(parseInt(amount) || 0)}
                  deliveryFees={{
                    usd: deliveryFeesUSD,
                    lbp: deliveryFeesLBP
                  }}
                />
              </CardContent>
            )}
          </Card>

          {/* Package Type */}
          <Card>
            <CardHeader>
              <CardTitle>Package Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ToggleGroup 
                type="single" 
                value={packageType}
                onValueChange={(value) => setPackageType(value as PackageType)}
                className="grid grid-cols-3 gap-2 w-full"
              >
                <ToggleGroupItem value="parcel" className="flex flex-col items-center gap-2 h-16">
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Parcel</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="document" className="flex flex-col items-center gap-2 h-16">
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Document</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="bulky" className="flex flex-col items-center gap-2 h-16">
                  <Box className="h-5 w-5" />
                  <span className="text-xs">Bulky</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-reference">Order Reference</Label>
                <Input
                  id="order-reference"
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                  placeholder="Enter order reference..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery-notes">Delivery Notes</Label>
                <Textarea
                  id="delivery-notes"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add any special delivery instructions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderForm;
