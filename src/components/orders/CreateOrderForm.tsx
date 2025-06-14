
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateOrder, useUpdateOrder } from '@/hooks/use-orders';
import { useSearchCustomersByPhone, useCreateCustomer } from '@/hooks/use-customers';
import { useGovernorates } from '@/hooks/use-governorates';
import { useCities } from '@/hooks/use-cities';
import { OrderWithCustomer, OrderType, PackageType } from '@/services/orders';
import { Customer } from '@/services/customers';
import { PhoneInput } from '@/components/ui/phone-input';
import ImprovedCashCollectionFields from './ImprovedCashCollectionFields';
import { toast } from 'sonner';

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
  
  // Customer state
  const [customerPhone, setCustomerPhone] = useState(initialOrder?.customer?.phone || '');
  const [customerName, setCustomerName] = useState(initialOrder?.customer?.name || '');
  const [customerAddress, setCustomerAddress] = useState(initialOrder?.customer?.address || '');
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
  const { data: cities = [] } = useCities(selectedGovernorate);
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
  };

  const resetCustomerForm = () => {
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerAddress('');
    setSelectedGovernorate('');
    setSelectedCity('');
    setIsWorkAddress(false);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              onClear={resetCustomerForm}
              className="w-full"
            />
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
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  rows={3}
                />
              </div>

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
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="work-address"
                  checked={isWorkAddress}
                  onCheckedChange={setIsWorkAddress}
                />
                <Label htmlFor="work-address">This is a work address</Label>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Order Type *</Label>
            <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as OrderType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Deliver" id="deliver" />
                <Label htmlFor="deliver">Delivery</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Exchange" id="exchange" />
                <Label htmlFor="exchange">Exchange</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Cash Collection" id="cash-collection" />
                <Label htmlFor="cash-collection">Cash Collection</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Package Type</Label>
            <Select value={packageType} onValueChange={(value) => setPackageType(value as PackageType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parcel">Parcel</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="bulky">Bulky Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="package-description">Package Description</Label>
            <Input
              id="package-description"
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
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
              onCheckedChange={setAllowOpening}
            />
            <Label htmlFor="allow-opening">Allow opening package for inspection</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cash Collection */}
      <ImprovedCashCollectionFields
        cashCollectionEnabled={cashCollectionEnabled}
        setCashCollectionEnabled={setCashCollectionEnabled}
        cashCollectionUSD={cashCollectionUSD}
        setCashCollectionUSD={setCashCollectionUSD}
        cashCollectionLBP={cashCollectionLBP}
        setCashCollectionLBP={setCashCollectionLBP}
        deliveryFeesUSD={deliveryFeesUSD}
        setDeliveryFeesUSD={setDeliveryFeesUSD}
        deliveryFeesLBP={deliveryFeesLBP}
        setDeliveryFeesLBP={setDeliveryFeesLBP}
      />

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
        >
          {isEditing ? 'Update Order' : 'Create Order'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/orders')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CreateOrderForm;
